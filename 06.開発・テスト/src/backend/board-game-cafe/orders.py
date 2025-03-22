"""Order management module for the board game cafe API"""

import json
import uuid
import time
from typing import Any, Dict, Optional
from decimal import Decimal

import boto3

from common import make_response

# AWS resources configuration
dynamodb = boto3.resource("dynamodb")
orders_table = dynamodb.Table("orders-table")
sessions_table = dynamodb.Table("table-sessions-table")
menu_table = dynamodb.Table("menu-items-table")

# Order status constants
ORDER_STATUS = {
    "PENDING": "pending",
    "PREPARING": "preparing",
    "READY": "ready",
    "DELIVERED": "delivered",
    "CANCELLED": "cancelled",
}


def create_order(event: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new order"""
    try:
        body = json.loads(event["body"])

        # Validate required fields
        required_fields = ["tableNumber", "items", "sessionId"]
        for field in required_fields:
            if field not in body:
                return make_response(400, {"error": f"Missing required field: {field}"})

        table_number = body["tableNumber"]
        session_id = body["sessionId"]
        items = body["items"]

        # Validate session exists
        session_response = sessions_table.get_item(
            Key={"tableNumber": table_number, "sessionId": session_id}
        )

        if "Item" not in session_response:
            return make_response(404, {"error": "Table session not found"})

        # Validate items exist and calculate total
        total_amount = Decimal("0")
        order_items = []

        for item in items:
            if "id" not in item or "quantity" not in item:
                return make_response(
                    400, {"error": "Each item must have id and quantity"}
                )

            menu_item_response = menu_table.get_item(Key={"id": item["id"]})
            if "Item" not in menu_item_response:
                return make_response(
                    404, {"error": f"Menu item {item['id']} not found"}
                )

            menu_item = menu_item_response["Item"]
            if not menu_item.get("isAvailable", True):
                return make_response(
                    400, {"error": f"Menu item {item['id']} is not available"}
                )

            item_price = menu_item["price"]
            item_total = item_price * Decimal(str(item["quantity"]))
            total_amount += item_total

            order_items.append(
                {
                    "id": item["id"],
                    "name": menu_item["name"],
                    "price": item_price,
                    "quantity": item["quantity"],
                    "itemTotal": item_total,
                }
            )

        # Create order
        timestamp = int(time.time())
        order_id = str(uuid.uuid4())

        order = {
            "orderId": order_id,
            "tableNumber": table_number,
            "sessionId": session_id,
            "items": order_items,
            "totalAmount": total_amount,
            "status": ORDER_STATUS["PENDING"],
            "createdAt": timestamp,
            "updatedAt": timestamp,
            "notes": body.get("notes", ""),
        }

        orders_table.put_item(Item=order)

        return make_response(201, {"order": order})
    except Exception as e:
        return make_response(500, {"error": str(e)})


def get_table_orders(
    table_number: int, session_id: Optional[str] = None
) -> Dict[str, Any]:
    """Get all orders for a specific table, optionally filtered by session ID"""
    try:
        if session_id:
            # Get orders for specific session
            response = orders_table.query(
                IndexName="TableSessionIndex",
                KeyConditionExpression="tableNumber = :tn AND sessionId = :sid",
                ExpressionAttributeValues={":tn": table_number, ":sid": session_id},
            )
        else:
            # Get all orders for table
            response = orders_table.query(
                IndexName="TableNumberIndex",
                KeyConditionExpression="tableNumber = :tn",
                ExpressionAttributeValues={":tn": table_number},
            )

        orders = response.get("Items", [])

        return make_response(200, {"orders": orders})
    except Exception as e:
        return make_response(500, {"error": str(e)})


def update_order_status(order_id: str, event: Dict[str, Any]) -> Dict[str, Any]:
    """Update the status of an order"""
    try:
        body = json.loads(event["body"])

        if "status" not in body:
            return make_response(400, {"error": "Missing required field: status"})

        new_status = body["status"]
        if new_status not in ORDER_STATUS.values():
            valid_statuses = ", ".join(ORDER_STATUS.values())
            return make_response(
                400, {"error": f"Invalid status. Valid values are: {valid_statuses}"}
            )

        # Check if order exists
        response = orders_table.get_item(Key={"orderId": order_id})
        if "Item" not in response:
            return make_response(404, {"error": "Order not found"})

        # Update order status
        timestamp = int(time.time())

        orders_table.update_item(
            Key={"orderId": order_id},
            UpdateExpression="SET #status = :status, updatedAt = :timestamp",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={":status": new_status, ":timestamp": timestamp},
            ReturnValues="ALL_NEW",
        )

        # Get updated order
        updated_response = orders_table.get_item(Key={"orderId": order_id})

        return make_response(200, {"order": updated_response["Item"]})
    except Exception as e:
        return make_response(500, {"error": str(e)})


def cancel_order(order_id: str, event: Dict[str, Any]) -> Dict[str, Any]:
    """Cancel an order"""
    try:
        # Check if order exists
        response = orders_table.get_item(Key={"orderId": order_id})
        if "Item" not in response:
            return make_response(404, {"error": "Order not found"})

        order = response["Item"]
        current_status = order["status"]

        # Only pending or preparing orders can be cancelled
        if current_status not in [ORDER_STATUS["PENDING"], ORDER_STATUS["PREPARING"]]:
            return make_response(
                400, {"error": f"Cannot cancel order with status: {current_status}"}
            )

        # Update order status to cancelled
        timestamp = int(time.time())

        orders_table.update_item(
            Key={"orderId": order_id},
            UpdateExpression="SET #status = :status, updatedAt = :timestamp",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={
                ":status": ORDER_STATUS["CANCELLED"],
                ":timestamp": timestamp,
            },
            ReturnValues="ALL_NEW",
        )

        # Get updated order
        updated_response = orders_table.get_item(Key={"orderId": order_id})

        return make_response(200, {"order": updated_response["Item"]})
    except Exception as e:
        return make_response(500, {"error": str(e)})
