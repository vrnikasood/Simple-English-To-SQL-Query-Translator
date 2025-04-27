import openai
from config import OPENAI_API_KEY

client = openai.api_key = OPENAI_API_KEY
try:
    models = client.models.list()
    print("API key works! Models:", [m.id for m in models.data])
except Exception as e:
    print("API key test failed:", e)