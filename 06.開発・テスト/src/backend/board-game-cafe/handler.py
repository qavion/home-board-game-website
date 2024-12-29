"""Lambda function to handle board game cafe API"""

import json
import os
import re
import uuid
from base64 import b64decode
from decimal import Decimal
from typing import Any, Dict
import datetime

import boto3
from botocore.config import Config

dynamodb = boto3.resource("dynamodb")
table_name = os.environ["DYNAMODB_TABLE_NAME"]
table = dynamodb.Table(table_name)
my_config = Config(region_name="ap-northeast-1", signature_version="s3v4")
s3_client = boto3.client("s3", config=my_config)
bucket_name = os.environ["S3_BUCKET_NAME"]
s3_image_path = os.environ["S3_IMAGE_PATH"]

admin_request_patterns = {
    "PUT": [re.compile(p) for p in [r"^/boardgames/.*$"]],
    "POST": [re.compile(p) for p in [r"^/boardgames$", r"^/boardgames/presigned-url$"]],
    "DELETE": [re.compile(p) for p in [r"^/boardgames/.*$"]],
}


class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert a DynamoDB item to JSON"""

    def default(self, o: Any) -> Any:
        if isinstance(o, Decimal):
            return float(o) if o % 1 > 0 else int(o)
        return super(DecimalEncoder, self).default(o)


def make_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """Helper function to make API response"""
    allow_origin = os.environ.get("ALLOW_ORIGIN", "*")
    return {
        "statusCode": status_code,
        "body": json.dumps(body, cls=DecimalEncoder, ensure_ascii=False),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": allow_origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Origin, Accept, Content-Type, x-api-key, Authorization",
        },
    }


def check_api_key(event: Dict[str, Any]) -> bool:
    """Check if the API key is valid"""
    api_key = os.environ.get("API_KEY")
    headers = event["headers"]
    print(headers)
    if "x-api-key" not in headers:
        return False
    return headers["x-api-key"] == api_key


def check_authorization(event: Dict[str, Any]) -> bool:
    """Check if the user is an admin"""
    auth_header = event["headers"].get("authorization")
    if not auth_header or not auth_header.startswith("Basic "):
        return False

    admin_username = os.environ.get("ADMIN_USERNAME")
    admin_password = os.environ.get("ADMIN_PASSWORD")
    username, password = b64decode(auth_header[6:]).decode().split(":")
    return username == admin_username and password == admin_password


def get_all_board_game() -> Dict[str, Any]:
    """
    Get all board game data from DynamoDB.
    Target data: id, title_kana, title, genre, tags, images, description,
    playerCount, playTime, age, difficulty, recommendation
    """
    target_attr = ", ".join(
        [
            "id",
            "title_kana",
            "title",
            "genre",
            "tags",
            "images",
            "description",
            "playerCount",
            "playTime",
            "age",
            "difficulty",
            "recommendation",
            "created",
            "lastModified",
            "arrivalDate",
        ]
    )
    try:
        response = table.scan(ProjectionExpression=target_attr)
        data = response["Items"]
        return make_response(200, data)
    except Exception as e:
        return make_response(500, {"error": str(e)})


def get_board_game(board_game_id: int) -> Dict[str, Any]:
    """Get board game data from DynamoDB by id"""
    try:
        response = table.get_item(Key={"id": board_game_id})
        if "Item" in response:
            return make_response(200, response["Item"])
        else:
            return make_response(404, {"error": "Board game not found"})
    except Exception as e:
        return make_response(500, {"error": str(e)})


def put_board_game(board_game_id: int, event: Dict[str, Any]) -> Dict[str, Any]:
    """Update board game data in DynamoDB by id"""
    try:
        body_dict = json.loads(event["body"], parse_float=Decimal)

        # check if the board game exists
        response = table.get_item(Key={"id": board_game_id})
        if "Item" not in response:
            return make_response(404, {"error": "Board game not found"})
        if "id" in body_dict and body_dict.pop("id") != board_game_id:
            message = f"Invalid ID: {body_dict['id']} != {board_game_id}"
            return make_response(400, {"error": message})
        # check if the request body is valid
        valid_types = {
            "id": int,
            "title_kana": str,
            "title": str,
            "genre": [str],
            "tags": [str],
            "images": [str],
            "description": str,
            "playerCount": {
                "min": int,
                "max": int,
                "text": str,
            },
            "playTime": {
                "min": int,
                "max": int,
                "text": str,
            },
            "age": {
                "min": int,
                "text": str,
            },
            "difficulty": str,
            "recommendation": Decimal,
            "rules": str,
            "arrivalDate": str,
        }
        required_object_elements = {
            "playerCount": ["min", "max", "text"],
            "playTime": ["min", "max", "text"],
            "age": ["min", "text"],
        }
        for key in body_dict:
            if key not in valid_types:
                return make_response(400, {"error": f"Invalid key: {key}"})

        # check all data types
        def check_data_type(data: Any, data_type: Any) -> bool:
            if isinstance(data_type, type):
                return isinstance(data, data_type)
            if isinstance(data_type, list):
                return all(check_data_type(item, data_type[0]) for item in data)
            if isinstance(data_type, dict):
                return all(check_data_type(data[key], data_type[key]) for key in data)
            raise ValueError(f"Invalid data type: {data_type}")

        for key in body_dict:
            if key not in required_object_elements:
                continue
            for element in required_object_elements[key]:
                if element in body_dict[key]:
                    continue
                message = f"Missing required element in {key}: {element}"
                return make_response(400, {"error": message})

        if not all(
            check_data_type(body_dict[key], valid_types[key]) for key in body_dict
        ):
            return make_response(
                400, {"error": f"Invalid data type. Expected {valid_types}"}
            )

        # update the board game data
        utc = datetime.timezone.utc
        body_dict["lastModified"] = datetime.datetime.now(utc).isoformat()
        if response["Item"].get("created") is None:
            body_dict["created"] = body_dict["lastModified"]
        update_expr = f"SET {', '.join(f'#{k} = :{k}' for k in body_dict)}"
        # for using DynamoDB reserved keywords, use ExpressionAttributeNames
        expression_attr_names = {f"#{k}": k for k in body_dict}
        expression_attr_values = {f":{k}": v for k, v in body_dict.items()}
        response = table.update_item(
            Key={"id": board_game_id},
            UpdateExpression=update_expr,
            ExpressionAttributeNames=expression_attr_names,
            ExpressionAttributeValues=expression_attr_values,
            ReturnValues="ALL_NEW",
        )
        return make_response(200, response["Attributes"])
    except Exception as e:
        return make_response(500, {"error": str(e)})


def get_next_board_game_id() -> int:
    """Get the next available board game ID"""
    try:
        response = table.scan(ProjectionExpression="id")
        ids = [item["id"] for item in response["Items"]]
        return max(ids) + 1 if ids else 1
    except Exception as e:
        raise Exception(f"Error getting next board game ID: {str(e)}") from e


def post_board_game(event: Dict[str, Any]) -> Dict[str, Any]:
    """Add new board game data to DynamoDB"""
    try:
        body_dict = json.loads(event["body"], parse_float=Decimal)
        board_game_id = get_next_board_game_id()
        current_time = datetime.datetime.now(datetime.timezone.utc).isoformat()
        body_dict["id"] = board_game_id
        body_dict["created"] = current_time
        body_dict["lastModified"] = current_time

        table.put_item(Item=body_dict)
        return make_response(201, body_dict)
    except Exception as e:
        return make_response(500, {"error": str(e)})


def delete_board_game(board_game_id: int) -> Dict[str, Any]:
    """Delete board game data from DynamoDB by id"""
    try:
        response = table.get_item(Key={"id": board_game_id})
        if "Item" not in response:
            return make_response(404, {"error": "Board game not found"})

        table.delete_item(Key={"id": board_game_id})
        return make_response(200, {"message": "Board game deleted"})
    except Exception as e:
        return make_response(500, {"error": str(e)})


def get_presigned_url(event: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a presigned URL for uploading an image to S3"""
    try:
        success_messages = ["Upload image to S3"]
        if "body" not in event:
            return make_response(
                400, {"error": "Request body is required {fileName, contentType}"}
            )
        body_dict = json.loads(event["body"])
        if "fileName" not in body_dict:
            file_name = uuid.uuid4().hex
            success_messages.append(
                "File name is not provided. Generated a random file name."
            )
        else:
            file_name = body_dict["fileName"]
        content_type = body_dict["contentType"]
        path = f"{s3_image_path}/{file_name}"
        # check file name and content type
        if not content_type:
            return make_response(400, {"error": "Content type is required"})
        if not content_type.startswith("image/"):
            return make_response(400, {"error": "Invalid content type (image/*)"})
        # check if the file name already exists in S3
        try:
            response = s3_client.head_object(Bucket=bucket_name, Key=path)
            message = f"File name already exists in S3 (last modified: {response['LastModified']})"
            return make_response(400, {"error": message})
        except s3_client.exceptions.ClientError as e:
            if not e.response["Error"]["Code"] == "404":
                raise e

        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": bucket_name,
                "Key": path,
                "ContentType": content_type,
            },
            ExpiresIn=3600,
            HttpMethod="PUT",
        )
        response_body = {
            "presignedUrl": presigned_url,
            "path": path,
            "message": "\n".join(success_messages),
        }
        return make_response(200, response_body)
    except Exception as e:
        return make_response(500, {"error": str(e)})


def login(event: Dict[str, Any]) -> Dict[str, Any]:
    """Handle login request and check if the user is an admin"""
    try:
        if check_authorization(event):
            return make_response(200, {"login": "OK", "isAdmin": True})
        else:
            return make_response(401, {"login": "NG", "isAdmin": False})
    except Exception as e:
        return make_response(500, {"error": str(e)})


def board_game_cafe(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Lambda handler function"""
    print(event)

    method = event["requestContext"]["http"]["method"]
    if method == "OPTIONS":
        return make_response(200, {})

    if not check_api_key(event):
        return make_response(403, {"error": "Forbidden"})

    path = event["requestContext"]["http"]["path"]

    if (
        method in admin_request_patterns
        and any(p.match(path) for p in admin_request_patterns[method])
        and not check_authorization(event)
    ):
        return make_response(401, {"error": "Unauthorized"})

    if method == "GET":
        if path == "/boardgames":
            # GET /boardgames
            return get_all_board_game()
        if path.startswith("/boardgames/"):
            # GET /boardgames/{id}
            board_game_id = int(path.split("/")[-1])
            return get_board_game(board_game_id)
    if method == "PUT":
        if path.startswith("/boardgames/"):
            # PUT /boardgames/{id}
            board_game_id = int(path.split("/")[-1])
            return put_board_game(board_game_id, event)
    if method == "POST":
        if path == "/boardgames":
            # POST /boardgames
            return post_board_game(event)
        if path == "/boardgames/presigned-url":
            # POST /boardgames/presigned-url
            return get_presigned_url(event)
        if path == "/login":
            # POST /login
            return login(event)
    if method == "DELETE":
        if path.startswith("/boardgames/"):
            # DELETE /boardgames/{id}
            board_game_id = int(path.split("/")[-1])
            return delete_board_game(board_game_id)
    return make_response(405, {"error": "Method not allowed"})
