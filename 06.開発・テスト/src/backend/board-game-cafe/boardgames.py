"""Board game management module for the board game cafe API"""

import json
import uuid
from typing import Any, Dict
from decimal import Decimal

import boto3

from common import make_response

# AWS resources configuration
dynamodb = boto3.resource("dynamodb")
board_games_table = dynamodb.Table("board-games-table")
s3_client = boto3.client("s3")
BUCKET_NAME = "board-game-cafe-images"
IMAGE_PREFIX = "boardgames/"


def get_all_board_game() -> Dict[str, Any]:
    """Get all board games"""
    try:
        response = board_games_table.scan()
        board_games = response.get("Items", [])

        return make_response(200, {"boardGames": board_games})
    except Exception as e:
        return make_response(500, {"error": str(e)})


def get_board_game(board_game_id: int) -> Dict[str, Any]:
    """Get a specific board game by ID"""
    try:
        response = board_games_table.get_item(Key={"id": board_game_id})

        if "Item" not in response:
            return make_response(404, {"error": "Board game not found"})

        return make_response(200, {"boardGame": response["Item"]})
    except Exception as e:
        return make_response(500, {"error": str(e)})


def post_board_game(event: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new board game"""
    try:
        body = json.loads(event["body"])

        # Validate required fields
        required_fields = [
            "name",
            "description",
            "playerMin",
            "playerMax",
            "playTime",
            "imageUrl",
        ]
        for field in required_fields:
            if field not in body:
                return make_response(400, {"error": f"Missing required field: {field}"})

        # Generate new ID
        all_games = board_games_table.scan().get("Items", [])
        new_id = 1
        if all_games:
            existing_ids = [game.get("id", 0) for game in all_games]
            new_id = max(existing_ids) + 1

        # Convert numeric fields to Decimal for DynamoDB
        board_game_item = {
            "id": new_id,
            "name": body["name"],
            "description": body["description"],
            "playerMin": Decimal(str(body["playerMin"])),
            "playerMax": Decimal(str(body["playerMax"])),
            "playTime": Decimal(str(body["playTime"])),
            "imageUrl": body["imageUrl"],
            "difficulty": Decimal(str(body.get("difficulty", 1))),
            "gameType": body.get("gameType", "その他"),
        }

        board_games_table.put_item(Item=board_game_item)

        return make_response(201, {"boardGame": board_game_item})
    except Exception as e:
        return make_response(500, {"error": str(e)})


def put_board_game(board_game_id: int, event: Dict[str, Any]) -> Dict[str, Any]:
    """Update an existing board game"""
    try:
        # Check if board game exists
        response = board_games_table.get_item(Key={"id": board_game_id})
        if "Item" not in response:
            return make_response(404, {"error": "Board game not found"})

        # Get update data
        body = json.loads(event["body"])

        # Update board game
        update_expression = "SET "
        expression_attribute_values = {}

        update_fields = [
            "name",
            "description",
            "playerMin",
            "playerMax",
            "playTime",
            "imageUrl",
            "difficulty",
            "gameType",
        ]

        for field in update_fields:
            if field in body:
                update_expression += f"{field} = :{field}, "
                # Convert numeric values to Decimal
                if field in ["playerMin", "playerMax", "playTime", "difficulty"]:
                    expression_attribute_values[f":{field}"] = Decimal(str(body[field]))
                else:
                    expression_attribute_values[f":{field}"] = body[field]

        # Remove trailing comma and space
        update_expression = update_expression.rstrip(", ")

        board_games_table.update_item(
            Key={"id": board_game_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW",
        )

        # Get updated item
        updated_response = board_games_table.get_item(Key={"id": board_game_id})

        return make_response(200, {"boardGame": updated_response["Item"]})
    except Exception as e:
        return make_response(500, {"error": str(e)})


def delete_board_game(board_game_id: int) -> Dict[str, Any]:
    """Delete a board game"""
    try:
        # Check if board game exists
        response = board_games_table.get_item(Key={"id": board_game_id})
        if "Item" not in response:
            return make_response(404, {"error": "Board game not found"})

        # Delete the board game
        board_games_table.delete_item(Key={"id": board_game_id})

        return make_response(200, {"message": "Board game deleted successfully"})
    except Exception as e:
        return make_response(500, {"error": str(e)})


def get_presigned_url(event: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a presigned URL for uploading an image to S3"""
    try:
        body = json.loads(event["body"])

        if "fileType" not in body:
            return make_response(400, {"error": "Missing required field: fileType"})

        file_type = body["fileType"]

        # Generate a unique filename
        file_name = f"{uuid.uuid4()}.{file_type.split('/')[-1]}"
        key = f"{IMAGE_PREFIX}{file_name}"

        # Generate presigned URL
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={"Bucket": BUCKET_NAME, "Key": key, "ContentType": file_type},
            ExpiresIn=300,  # URL expires in 5 minutes
        )

        # Generate the URL that will be used to access the image
        image_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{key}"

        return make_response(200, {"uploadUrl": presigned_url, "imageUrl": image_url})
    except Exception as e:
        return make_response(500, {"error": str(e)})
