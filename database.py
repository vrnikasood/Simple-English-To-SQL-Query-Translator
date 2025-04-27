import sqlite3
import os
from datetime import datetime

class Database:
    def __init__(self, db_path):
        self.db_path = db_path
        self._create_tables()
    
    def _create_tables(self):
        """Create tables if they don't exist"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create query history table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS query_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            input_text TEXT NOT NULL,
            output_text TEXT NOT NULL,
            translation_mode TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def save_query(self, input_text, output_text, translation_mode):
        """Save a query to the history"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT INTO query_history (input_text, output_text, translation_mode, timestamp)
        VALUES (?, ?, ?, ?)
        ''', (input_text, output_text, translation_mode, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
    
    def get_query_history(self, limit=20):
        """Get recent query history"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT id, input_text, output_text, translation_mode, timestamp
        FROM query_history
        ORDER BY timestamp DESC
        LIMIT ?
        ''', (limit,))
        
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return results
    
    def clear_history(self):
        """Clear all query history"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM query_history')
        
        conn.commit()
        conn.close()