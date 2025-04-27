import os
import openai
from config import OPENAI_API_KEY
import traceback

# Set OpenAI API key
openai.api_key = OPENAI_API_KEY

class Translator:
    def __init__(self):
        self.model = "gpt-4o-mini"
    
    def translate_nl_to_sql(self, text, schema=None):
        """Translate natural language to SQL query"""
        messages = [
            {"role": "system", "content": "You are a helpful assistant that translates natural language into SQL queries. Provide only the SQL query without any explanation."}
        ]
        
        if schema:
            messages[0]["content"] += f" Use the following database schema for context: {schema}"
        
        messages.append({"role": "user", "content": text})
        
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=messages,
                temperature=0.1,  # Lower temperature for more deterministic outputs
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            print("Exception occurred:", e)
            traceback.print_exc()
            return f"Error: {str(e)}"
    
    def translate_sql_to_nl(self, sql_query):
        """Translate SQL query to natural language"""
        messages = [
            {"role": "system", "content": "You are a helpful assistant that explains SQL queries in plain English. Provide a clear and concise explanation of what the SQL query does."}, 
            {"role": "user", "content": sql_query}
        ]
        
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=messages,
                temperature=0.5,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            print("Exception occurred:", e)
            traceback.print_exc()
            return f"Error: {str(e)}"