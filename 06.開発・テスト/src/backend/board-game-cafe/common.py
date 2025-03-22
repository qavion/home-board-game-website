"""Common utilities for the board game cafe API"""

import json
from decimal import Decimal
from typing import Any, Dict

from config import ALLOW_ORIGIN


class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert a DynamoDB item to JSON"""

    def default(self, o: Any) -> Any:
        if isinstance(o, Decimal):
            return float(o) if o % 1 > 0 else int(o)
        return super(DecimalEncoder, self).default(o)


def make_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """Helper function to make API response"""
    return {
        "statusCode": status_code,
        "body": json.dumps(body, cls=DecimalEncoder, ensure_ascii=False),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": ALLOW_ORIGIN,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Origin, Accept, Content-Type, x-api-key, Authorization",
        },
    }
