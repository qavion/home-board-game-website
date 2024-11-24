"""Lambda function to handle board game cafe API"""

import json
import os
from decimal import Decimal
from typing import Any, Dict

import boto3

# from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource("dynamodb")
table_name = os.environ["DYNAMODB_TABLE_NAME"]
table = dynamodb.Table(table_name)


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
        # print(update_expr)
        # print(expression_attr_values)
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
        pass  # TODO
    return make_response(405, {"error": "Method not allowed"})
