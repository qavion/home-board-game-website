"""Route definitions and routing mechanism for the board game cafe API"""

import re
from typing import Any, Callable, Dict, List, Pattern, Tuple, Optional

from auth import login
from boardgames import (
    get_all_board_game,
    get_board_game,
    put_board_game,
    post_board_game,
    delete_board_game,
    get_presigned_url,
)
from menu import (
    get_all_menu_items,
    get_menu_item,
    post_menu_item,
    put_menu_item,
    delete_menu_item,
)
from orders import (
    create_order,
    get_table_orders,
    update_order_status,
    cancel_order,
)
from sessions import (
    initialize_table_session,
    get_table_sessions,
    close_table_session,
)

# Route definition type
# (HTTP method, path pattern regex, handler function, requires admin, param names)
RouteDefinition = Tuple[str, Pattern, Callable, bool, List[str]]

# Define routes with regex patterns for path matching
ROUTES: List[RouteDefinition] = [
    # Board games routes
    ("GET", re.compile(r"^/boardgames$"), get_all_board_game, False, []),
    ("GET", re.compile(r"^/boardgames/(\d+)$"), get_board_game, False, ["board_game_id"]),
    ("POST", re.compile(r"^/boardgames$"), post_board_game, True, []),
    ("POST", re.compile(r"^/boardgames/presigned-url$"), get_presigned_url, True, []),
    ("PUT", re.compile(r"^/boardgames/(\d+)$"), put_board_game, True, ["board_game_id"]),
    ("DELETE", re.compile(r"^/boardgames/(\d+)$"), delete_board_game, True, ["board_game_id"]),

    # Menu routes
    ("GET", re.compile(r"^/menu$"), get_all_menu_items, False, []),
    ("GET", re.compile(r"^/menu/(\d+)$"), get_menu_item, False, ["menu_item_id"]),
    ("POST", re.compile(r"^/menu$"), post_menu_item, True, []),
    ("PUT", re.compile(r"^/menu/(\d+)$"), put_menu_item, True, ["menu_item_id"]),
    ("DELETE", re.compile(r"^/menu/(\d+)$"), delete_menu_item, True, ["menu_item_id"]),

    # Table session routes
    ("GET", re.compile(r"^/table-sessions$"), get_table_sessions, False, []),
    ("POST", re.compile(r"^/table-sessions$"), initialize_table_session, False, []),
    ("DELETE", re.compile(r"^/table-sessions/(\d+)$"), close_table_session, True, ["table_number"]),

    # Order routes
    ("GET", re.compile(r"^/orders/table/(\d+)$"), get_table_orders, False, ["table_number"]),
    ("POST", re.compile(r"^/orders$"), create_order, False, []),
    ("PUT", re.compile(r"^/orders/([^/]+)/status$"), update_order_status, True, ["order_id"]),
    ("DELETE", re.compile(r"^/orders/([^/]+)$"), cancel_order, False, ["order_id"]),

    # Authentication routes
    ("POST", re.compile(r"^/login$"), login, False, []),
]

def find_route(method: str, path: str) -> Tuple[Optional[Callable], Dict[str, Any], bool]:
    """
    Find a matching route for the given method and path

    Returns:
        Tuple of (handler function, extracted parameters, requires admin)
        If no route is found, handler will be None
    """
    for route_method, path_pattern, handler, requires_admin, param_names in ROUTES:
        if method != route_method:
            continue
        if not (match := path_pattern.match(path)):
            continue
        params = {}
        for i, name in enumerate(param_names):
            try:
                params[name] = int(match.group(i+1))
            except ValueError:
                params[name] = match.group(i+1)
        return handler, params, requires_admin
    return None, {}, False
