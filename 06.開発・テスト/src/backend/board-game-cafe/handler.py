"""Lambda function to handle board game cafe API"""

from typing import Any, Dict

from auth import check_api_key, check_authorization
from common import make_response
from routes import find_route


def board_game_cafe(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Lambda handler function"""
    print(event)

    # OPTIONS request for CORS
    method = event["requestContext"]["http"]["method"]
    if method == "OPTIONS":
        return make_response(200, {})

    # API Key validation
    if not check_api_key(event):
        return make_response(403, {"error": "Forbidden"})

    path = event["requestContext"]["http"]["path"]

    # Find matching route
    handler, path_params, requires_admin = find_route(method, path)

    if not handler:
        return make_response(404, {"error": "Not found"})

    # Admin authorization check for protected endpoints
    if requires_admin and not check_authorization(event):
        return make_response(401, {"error": "Unauthorized"})

    # Add query parameters if they exist
    if "queryStringParameters" in event and event["queryStringParameters"]:
        path_params.update(event["queryStringParameters"])

    # Call the handler function
    if method in ["POST", "PUT"]:
        # For POST and PUT requests, pass both event and path params
        return handler(event, **path_params)
    elif path_params:
        # For GET and DELETE with path params
        return handler(**path_params)
    else:
        # For simple GET and DELETE without params
        return handler()
