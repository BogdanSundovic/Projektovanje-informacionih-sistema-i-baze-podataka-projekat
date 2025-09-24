import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
API_KEY = os.getenv("CLOUDINARY_API_KEY")
API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

if CLOUD_NAME and API_KEY and API_SECRET:
    cloudinary.config(
        cloud_name=CLOUD_NAME,
        api_key=API_KEY,
        api_secret=API_SECRET
    )


def upload_to_cloudinary(file_path: str, public_id: str):
    # If credentials are not provided, skip upload gracefully
    if not (CLOUD_NAME and API_KEY and API_SECRET):
        return None
    result = cloudinary.uploader.upload(file_path, public_id=public_id, folder="form-images")
    return result.get("secure_url")
