"""Menu management module for the board game cafe API"""

import json
from typing import Any, Dict
from decimal import Decimal

import boto3

from common import make_response

# AWS resources configuration
dynamodb = boto3.resource("dynamodb")
menu_table = dynamodb.Table("menu-items-table")

def get_all_menu_items() -> Dict[str, Any]:
    """Get all menu items"""
    try:
        response = menu_table.scan()
        menu_items = response.get("Items", [])
        
        return make_response(200, {"menuItems": menu_items})
    except Exception as e:
        return make_response(500, {"error": str(e)})

def get_menu_item(menu_item_id: int) -> Dict[str, Any]:
    """Get a specific menu item by ID"""
    try:
        response = menu_table.get_item(Key={"id": menu_item_id})
        
        if "Item" not in response:
            return make_response(404, {"error": "Menu item not found"})
        
        return make_response(200, {"menuItem": response["Item"]})
    except Exception as e:
        return make_response(500, {"error": str(e)})

def post_menu_item(event: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new menu item"""
    try:
        body = json.loads(event["body"])
        
        # Validate required fields
        required_fields = ["name", "price", "category"]
        for field in required_fields:
            if field not in body:
                return make_response(400, {"error": f"Missing required field: {field}"})
        
        # Generate new ID
        all_items = menu_table.scan().get("Items", [])
        new_id = 1
        if all_items:
            existing_ids = [item.get("id", 0) for item in all_items]
            new_id = max(existing_ids) + 1
        
        # Convert numeric fields to Decimal for DynamoDB
        menu_item = {
            "id": new_id,
            "name": body["name"],
            "price": Decimal(str(body["price"])),
            "category": body["category"],
            "description": body.get("description", ""),
            "isAvailable": body.get("isAvailable", True),
            "imageUrl": body.get("imageUrl", "")
        }
        
        menu_table.put_item(Item=menu_item)
        
        return make_response(201, {"menuItem": menu_item})
    except Exception as e:
        return make_response(500, {"error": str(e)})

def put_menu_item(menu_item_id: int, event: Dict[str, Any]) -> Dict[str, Any]:
    """Update an existing menu item"""
    try:
        # Check if menu item exists
        response = menu_table.get_item(Key={"id": menu_item_id})
        if "Item" not in response:
            return make_response(404, {"error": "Menu item not found"})
        
        # Get update data
        body = json.loads(event["body"])
        
        # Update menu item
        update_expression = "SET "
        expression_attribute_values = {}
        
        update_fields = [
            "name", "price", "category", "description", "isAvailable", "imageUrl"
        ]
        
        for field in update_fields:
            if field in body:
                update_expression += f"{field} = :{field}, "
                # Convert price to Decimal
                if field == "price":
                    expression_attribute_values[f":{field}"] = Decimal(str(body[field]))
                else:
                    expression_attribute_values[f":{field}"] = body[field]
        
        # Remove trailing comma and space
        update_expression = update_expression.rstrip(", ")
        
        menu_table.update_item(
            Key={"id": menu_item_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )
        
        # Get updated item
        updated_response = menu_table.get_item(Key={"id": menu_item_id})
        
        return make_response(200, {"menuItem": updated_response["Item"]})
    except Exception as e:
        return make_response(500, {"error": str(e)})

def delete_menu_item(menu_item_id: int) -> Dict[str, Any]:
    """Delete a menu item"""
    try:
        # Check if menu item exists
        response = menu_table.get_item(Key={"id": menu_item_id})
        if "Item" not in response:
            return make_response(404, {"error": "Menu item not found"})
        
        # Delete the menu item
        menu_table.delete_item(Key={"id": menu_item_id})
        
        return make_response(200, {"message": "Menu item deleted successfully"})
    except Exception as e:
        return make_response(500, {"error": str(e)})