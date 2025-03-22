"""Configuration and environment variables for the board game cafe API"""

import os
import re
import boto3
from botocore.config import Config

# AWS Configuration
my_config = Config(region_name="ap-northeast-1", signature_version="s3v4")

# DynamoDB resources
dynamodb = boto3.resource("dynamodb")
table_name = os.environ["DYNAMODB_TABLE_NAME"]
table = dynamodb.Table(table_name)
menu_table_name = os.environ["DYNAMODB_MENU_TABLE_NAME"]
menu_table = dynamodb.Table(menu_table_name)
orders_table_name = os.environ["DYNAMODB_ORDERS_TABLE_NAME"]
orders_table = dynamodb.Table(orders_table_name)
table_sessions_table_name = os.environ["DYNAMODB_TABLE_SESSIONS_TABLE_NAME"]
table_sessions_table = dynamodb.Table(table_sessions_table_name)

# S3 Configuration
s3_client = boto3.client("s3", config=my_config)
bucket_name = os.environ["S3_BUCKET_NAME"]
s3_image_path = os.environ["S3_IMAGE_PATH"]
original_dir = os.environ["ORIGINAL_DIR"]

# API Configuration
ALLOW_ORIGIN = os.environ.get("ALLOW_ORIGIN", "*")
API_KEY = os.environ.get("API_KEY")
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")

# Admin request patterns
admin_request_patterns = {
    "PUT": [
        re.compile(p)
        for p in [
            r"^/boardgames/.*$",
            r"^/menu/.*$",
            r"^/table-sessions/.*$",
            r"^/orders/.*/status$",
        ]
    ],
    "POST": [
        re.compile(p)
        for p in [
            r"^/boardgames$",
            r"^/boardgames/presigned-url$",
            r"^/menu$",
            r"^/table-sessions$",
        ]
    ],
    "DELETE": [
        re.compile(p)
        for p in [r"^/boardgames/.*$", r"^/menu/.*$", r"^/table-sessions/.*$"]
    ],
}
