import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "GIS Colab API"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS = ["http://localhost:5173"]

settings = Settings()
