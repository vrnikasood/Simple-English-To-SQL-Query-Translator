# SQL-NL Translator

A modern, responsive web application that translates between SQL queries and Natural Language (English) using the OpenAI API. Built to help non-technical users interact with databases and understand SQL easily.

## Core Features

- Dark mode toggle
- Lowercase/Uppercase toggle
- Copy to clipboard functionality
- SQL syntax highlighting
- Schema awareness (Beta) for context-aware translations
- Query history (stored locally or in database)
- Reverse mode: Natural Language → SQL and SQL → Natural Language
- OpenAI GPT-4 integration for translations

## Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)
- Highlight.js for syntax highlighting
- LocalStorage for simple query history

### Backend
- Python Flask
- SQLite database (for optional query history)

### External APIs
- OpenAI API

## Setup Instructions

1. Clone the repository
2. Install the required Python packages: `pip install -r requirements.txt`
3. Create a `.env` file in the root directory with your OpenAI API key: `OPENAI_API_KEY=your_api_key_here`
4. Run the Flask server: `python backend/app.py`
5. Open `frontend/index.html` in your browser

## Project Structure

```
sql-nl-translator/
├── backend/
│   ├── app.py
│   ├── translator.py
│   ├── database.py
│   └── config.py
├── frontend/
│   ├── index.html
│   ├── translator.html
│   ├── about.html
│   ├── assets/
│   │   ├── styles.css
│   │   └── script.js
├── .env
├── README.md
├── requirements.txt
```

## License

MIT