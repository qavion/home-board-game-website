"""Lambda function to handle board game cafe API"""

import json
import os
import uuid
from decimal import Decimal
from typing import Any, Dict

import boto3

# from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource("dynamodb")
table_name = os.environ["DYNAMODB_TABLE_NAME"]
table = dynamodb.Table(table_name)
s3_client = boto3.client("s3")
bucket_name = os.environ["S3_BUCKET_NAME"]
s3_image_path = os.environ["S3_IMAGE_PATH"]


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
            "Access-Control-Allow-Headers": "Origin, Accept, Content-Type, x-api-key",
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
        update_expr = f"SET {', '.join(k + ' = :' + k for k in body_dict)}"
        expression_attr_values = {f":{k}": v for k, v in body_dict.items()}
        response = table.update_item(
            Key={"id": board_game_id},
            UpdateExpression=update_expr,
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
        body_dict["id"] = board_game_id

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
            return make_response(
                400,
                {
                    "error": f"File name already exists in S3 (last modified: {response['LastModified']})"
                },
            )
        except s3_client.exceptions.ClientError as e:
            if e.response["Error"]["Code"] == "404":
                pass

        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": bucket_name,
                "Key": path,
                "ContentType": content_type,
            },
            ExpiresIn=3600,
        )
        response_body = {
            "presignedUrl": presigned_url,
            "path": path,
            "message": "\n".join(success_messages),
        }
        return make_response(200, response_body)
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
    if method == "GET":
        if path == "/boardgames":
            # GET /boardgames
            return get_all_board_game()
        if path == "/boardgames/presigned-url":
            # GET /boardgames/presigned-url
            return get_presigned_url(event)
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
    if method == "DELETE":
        if path.startswith("/boardgames/"):
            # DELETE /boardgames/{id}
            board_game_id = int(path.split("/")[-1])
            return delete_board_game(board_game_id)
    return make_response(405, {"error": "Method not allowed"})
