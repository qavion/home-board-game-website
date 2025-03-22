"""Table session management module for the board game cafe API"""

import json
import uuid
import time
from typing import Any, Dict

import boto3

from common import make_response

# AWS resources configuration
dynamodb = boto3.resource("dynamodb")
sessions_table = dynamodb.Table("table-sessions-table")
orders_table = dynamodb.Table("orders-table")


def initialize_table_session(event: Dict[str, Any]) -> Dict[str, Any]:
    """Initialize a new session for a table"""
    try:
        body = json.loads(event["body"])

        if "tableNumber" not in body:
            return make_response(400, {"error": "Missing required field: tableNumber"})

        table_number = body["tableNumber"]
        customer_count = body.get("customerCount", 1)

        # Check if table already has an active session
        active_sessions = sessions_table.query(
            IndexName="TableNumberIndex",
            KeyConditionExpression="tableNumber = :tn",
            FilterExpression="endTime = :null",
            ExpressionAttributeValues={
                ":tn": table_number,
                ":null": 0,  # 0 indicates session is still active
            },
        ).get("Items", [])

        if active_sessions:
            return make_response(
                400, {"error": f"Table {table_number} already has an active session"}
            )

        # Create new session
        session_id = str(uuid.uuid4())
        timestamp = int(time.time())

        session = {
            "tableNumber": table_number,
            "sessionId": session_id,
            "customerCount": customer_count,
            "startTime": timestamp,
            "endTime": 0,  # 0 indicates session is still active
            "notes": body.get("notes", ""),
        }

        sessions_table.put_item(Item=session)

        return make_response(201, {"session": session})
    except Exception as e:
        return make_response(500, {"error": str(e)})


def get_table_sessions() -> Dict[str, Any]:
    """Get all table sessions, including active and closed ones"""
    try:
        response = sessions_table.scan()
        sessions = response.get("Items", [])

        # Sort sessions: active first, then by start time (newest first)
        sessions.sort(key=lambda s: (s["endTime"] != 0, -s["startTime"]))

        return make_response(200, {"sessions": sessions})
    except Exception as e:
        return make_response(500, {"error": str(e)})


def close_table_session(table_number: int) -> Dict[str, Any]:
    """Close an active session for a table"""
    try:
        # Find active session for the table
        active_sessions = sessions_table.query(
            IndexName="TableNumberIndex",
            KeyConditionExpression="tableNumber = :tn",
            FilterExpression="endTime = :null",
            ExpressionAttributeValues={":tn": table_number, ":null": 0},
        ).get("Items", [])

        if not active_sessions:
            return make_response(
                404, {"error": f"No active session found for table {table_number}"}
            )

        if len(active_sessions) > 1:
            return make_response(
                500,
                {"error": f"Multiple active sessions found for table {table_number}"},
            )

        active_session = active_sessions[0]
        session_id = active_session["sessionId"]

        # Check for any pending or preparing orders
        pending_orders = orders_table.query(
            IndexName="TableSessionIndex",
            KeyConditionExpression="tableNumber = :tn AND sessionId = :sid",
            FilterExpression="#status IN (:s1, :s2)",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={
                ":tn": table_number,
                ":sid": session_id,
                ":s1": "pending",
                ":s2": "preparing",
            },
        ).get("Items", [])

        if pending_orders:
            return make_response(
                400,
                {
                    "error": "Cannot close session with pending orders",
                    "pendingOrders": pending_orders,
                },
            )

        # Close the session
        timestamp = int(time.time())

        sessions_table.update_item(
            Key={"tableNumber": table_number, "sessionId": session_id},
            UpdateExpression="SET endTime = :et",
            ExpressionAttributeValues={":et": timestamp},
            ReturnValues="ALL_NEW",
        )

        # Get updated session
        updated_response = sessions_table.get_item(
            Key={"tableNumber": table_number, "sessionId": session_id}
        )

        return make_response(200, {"session": updated_response["Item"]})
    except Exception as e:
        return make_response(500, {"error": str(e)})
