import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get OpenAI API key from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Check if API key is available
if not OPENAI_API_KEY:
    raise ValueError("OpenAI API key not found. Please add it to your .env file.")

# Flask configuration
class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() in ('true', '1', 't')
    DATABASE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'query_history.db')