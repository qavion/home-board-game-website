"""Authentication and authorization functions for the board game cafe API"""

import base64
from typing import Any, Dict

from common import make_response
from config import API_KEY, ADMIN_USERNAME, ADMIN_PASSWORD


def check_api_key(event: Dict[str, Any]) -> bool:
    """Check if the API key is valid"""
    headers = event["headers"]
    print(headers)
    if "x-api-key" not in headers:
        return False
    return headers["x-api-key"] == API_KEY


def check_authorization(event: Dict[str, Any]) -> bool:
    """Check if the user is an admin"""
    auth_header = event["headers"].get("authorization")
    if not auth_header or not auth_header.startswith("Basic "):
        return False

    username, password = base64.b64decode(auth_header[6:]).decode().split(":")
    return username == ADMIN_USERNAME and password == ADMIN_PASSWORD


def login(event: Dict[str, Any]) -> Dict[str, Any]:
    """Handle login request and check if the user is an admin"""
    try:
        if check_authorization(event):
            return make_response(200, {"login": "OK", "isAdmin": True})
        else:
            return make_response(401, {"login": "NG", "isAdmin": False})
    except Exception as e:
        return make_response(500, {"error": str(e)})
