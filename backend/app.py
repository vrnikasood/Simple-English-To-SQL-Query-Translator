from flask import Flask, request, jsonify, render_template
import os
import json
from flask_cors import CORS
from backend.translator import Translator
from database import Database
from config import Config

app = Flask(__name__, static_folder='../frontend/assets', template_folder='../frontend')
CORS(app)  # Enable CORS for all routes

# Load configuration
app.config.from_object(Config)

# Initialize translator and database
translator = Translator()
database = Database(app.config['DATABASE_PATH'])

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/translator')
def translator_page():
    """Serve the translator page"""
    return render_template('translator.html')

@app.route('/about')
def about_page():
    """Serve the about page"""
    return render_template('about.html')

@app.route('/translate', methods=['POST'])
def translate():
    data = request.json
    input_text = data['input']
    schema = data.get('schema', '')
    mode = data.get('mode', 'nl_to_sql')
    
    # Use the Translator class for consistency
    if mode == 'nl_to_sql':
        result = translator.translate_nl_to_sql(input_text, schema)
    else:
        result = translator.translate_sql_to_nl(input_text)
        
    return jsonify({'output': result})

@app.route('/api/translate', methods=['POST'])
def translate_api():
    """API endpoint for translation"""
    data = request.json
    
    if not data or 'text' not in data or 'mode' not in data:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    text = data['text']
    mode = data['mode']
    schema = data.get('schema', None)  # Optional schema for context-aware translations
    
    if not text:
        return jsonify({'error': 'Text cannot be empty'}), 400
    
    # Perform translation based on mode
    if mode == 'nl_to_sql':
        result = translator.translate_nl_to_sql(text, schema)
    elif mode == 'sql_to_nl':
        result = translator.translate_sql_to_nl(text)
    else:
        return jsonify({'error': 'Invalid translation mode'}), 400
    
    # Save to history if successful
    if not result.startswith('Error'):
        database.save_query(text, result, mode)
    
    return jsonify({
        'input': text,
        'output': result,
        'mode': mode
    })

@app.route('/api/history', methods=['GET'])
def get_history():
    """API endpoint to get query history"""
    history = database.get_query_history()
    return jsonify(history)

@app.route('/api/history', methods=['POST'])
def save_history():
    """API endpoint to save query to history"""
    data = request.json
    
    if not data or 'input' not in data or 'output' not in data or 'mode' not in data:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    database.save_query(data['input'], data['output'], data['mode'])
    return jsonify({'status': 'success'})

@app.route('/api/history/clear', methods=['POST'])
def clear_history():
    """API endpoint to clear query history"""
    database.clear_history()
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    # Ensure the database directory exists
    os.makedirs(os.path.dirname(app.config['DATABASE_PATH']), exist_ok=True)
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=app.config['DEBUG'])