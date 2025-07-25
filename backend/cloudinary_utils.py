import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name="dgfjwysgs",
    api_key="694113891773135",
    api_secret="iBlLyt8P7eQwAFdBJiynHfnJDkQ"
)

def upload_to_cloudinary(file_path: str, public_id: str):
    result = cloudinary.uploader.upload(file_path, public_id=public_id, folder="form-images")
    return result.get("secure_url")

