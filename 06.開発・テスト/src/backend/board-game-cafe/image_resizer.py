"""Lambda function to resize images uploaded to S3."""

import os
from io import BytesIO
from typing import Any, Dict

import boto3

from PIL import Image

s3_client = boto3.client("s3")


def resize_image(image: Image.Image, size: tuple[int, int]) -> BytesIO:
    """Resize the given image to the specified size while maintaining the aspect ratio."""
    image.thumbnail(size, Image.Resampling.BICUBIC)
    image = image.convert("RGB")
    buffer = BytesIO()
    image.save(buffer, "JPEG")
    buffer.seek(0)
    return buffer


def handler(event: Dict[str, Any], context: Any) -> None:
    """Lambda function handler to resize images uploaded to S3."""
    bucket_name = os.environ["S3_BUCKET_NAME"]
    s3_image_path = os.environ["S3_IMAGE_PATH"]
    resized_s_dir = os.environ["RESIZED_S_DIR"]
    resized_m_dir = os.environ["RESIZED_M_DIR"]
    valid_content_types = ["image/jpeg", "image/png"]

    for record in event["Records"]:
        key = record["s3"]["object"]["key"]
        response = s3_client.head_object(Bucket=bucket_name, Key=key)
        content_type = response["ContentType"]

        if content_type not in valid_content_types:
            continue

        response = s3_client.get_object(Bucket=bucket_name, Key=key)
        image = Image.open(response["Body"])

        basename, _ = os.path.splitext(os.path.basename(key))

        # Resize to medium
        medium_image = resize_image(image, (500, 500))
        s3_client.upload_fileobj(medium_image, bucket_name, f"{s3_image_path}/{resized_m_dir}/{basename}.jpg")

        # Resize to small
        small_image = resize_image(image, (100, 100))
        s3_client.upload_fileobj(small_image, bucket_name, f"{s3_image_path}/{resized_s_dir}/{basename}.jpg")
