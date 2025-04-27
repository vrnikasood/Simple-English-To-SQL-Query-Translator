// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Translation Elements
    const translationMode = document.getElementById('translationMode');
    const swapModeBtn = document.getElementById('swapMode');
    const inputLabel = document.getElementById('inputLabel');
    const outputLabel = document.getElementById('outputLabel');
    const inputText = document.getElementById('inputText');
    const schemaSection = document.getElementById('schemaSection');
    const schemaText = document.getElementById('schemaText');
    const outputText = document.getElementById('outputText');
    const translateBtn = document.getElementById('translateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const caseToggle = document.getElementById('caseToggle');
    if (caseToggle) {
        caseToggle.addEventListener('change', applyCaseTransformation);
    }
    
    // History Elements
    const historyBtn = document.getElementById('historyBtn');
    const historyModal = document.getElementById('historyModal');
    const closeModalBtn = document.querySelector('.close');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    // Initialize UI
    initTheme();
    updateLabels();
    loadHistory();
    
    // Event Listeners
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', toggleDarkMode);
    }
    
    if (translationMode) {
        translationMode.addEventListener('change', updateLabels);
    }
    
    if (swapModeBtn) {
        swapModeBtn.addEventListener('click', swapTranslationMode);
    }
    
    if (translateBtn) {
        translateBtn.addEventListener('click', translateText);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearInput);
    }
    
    if (copyBtn) {
        copyBtn.addEventListener('click', copyToClipboard);
    }
    
    if (caseToggle) {
        caseToggle.addEventListener('change', applyCaseTransformation);
    }
    
    if (historyBtn) {
        historyBtn.addEventListener('click', openHistoryModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeHistoryModal);
    }
    
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearHistory);
    }
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === historyModal) {
            closeHistoryModal();
        }
    });
    
    // Theme Functions
    function initTheme() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            if (darkModeToggle) darkModeToggle.checked = true;
        }
    }
    
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }
    
    // Translation Functions
    function updateLabels() {
        if (!translationMode || !inputLabel || !outputLabel) return;
        
        const mode = translationMode.value;
        if (mode === 'nl_to_sql') {
            inputLabel.textContent = 'Natural Language';
            outputLabel.textContent = 'SQL Query';
            inputText.placeholder = 'Enter your query in natural language...';
            if (schemaSection) schemaSection.style.display = 'block';
        } else {
            inputLabel.textContent = 'SQL Query';
            outputLabel.textContent = 'Natural Language';
            inputText.placeholder = 'Enter your SQL query...';
            if (schemaSection) schemaSection.style.display = 'none';
        }
    }
    
    function swapTranslationMode() {
        if (!translationMode) return;
        
        translationMode.value = translationMode.value === 'nl_to_sql' ? 'sql_to_nl' : 'nl_to_sql';
        updateLabels();
        
        // Swap input and output if they contain text
        if (outputText.textContent.trim()) {
            const temp = inputText.value;
            inputText.value = outputText.textContent;
            outputText.textContent = temp;
            applyCaseTransformation();
        }
    }
    
    async function translateText() {
        if (!inputText || !outputText) return;
        
        const input = inputText.value.trim();
        if (!input) {
            showNotification('Please enter text to translate', 'error');
            return;
        }
        
        // Show loading state
        translateBtn.disabled = true;
        translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';
        outputText.textContent = 'Translating...';
        
        try {
            const mode = translationMode.value;
            const schema = mode === 'nl_to_sql' && schemaText ? schemaText.value.trim() : null;
            
            const response = await fetch('/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: input,
                    mode: mode,
                    schema: schema
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                outputText.textContent = data.output;
                applyCaseTransformation();
                saveToHistory(data.input, data.output, data.mode);
                
                // Apply syntax highlighting for SQL
                if (mode === 'nl_to_sql' && hljs) {
                    hljs.highlightElement(outputText);
                }
                
                showNotification('Translation completed', 'success');
            } else {
                outputText.textContent = data.error || 'An error occurred during translation';
                showNotification('Translation failed', 'error');
            }
        } catch (error) {
            console.error('Translation error:', error);
            outputText.textContent = 'Error: Could not connect to the translation service';
            showNotification('Connection error', 'error');
        } finally {
            // Reset button state
            translateBtn.disabled = false;
            translateBtn.innerHTML = 'Translate';
        }
    }
    
    function clearInput() {
        if (inputText) inputText.value = '';
        if (outputText) outputText.textContent = '';
        if (schemaText) schemaText.value = '';
    }
    
    function copyToClipboard() {
        if (!outputText) return;
        
        const output = outputText.textContent;
        if (!output.trim()) {
            showNotification('Nothing to copy', 'error');
            return;
        }
        
        navigator.clipboard.writeText(output)
            .then(() => {
                showNotification('Copied to clipboard', 'success');
            })
            .catch(err => {
                console.error('Copy failed:', err);
                showNotification('Failed to copy', 'error');
            });
    }
    
    function applyCaseTransformation() {
        if (!outputText || !caseToggle) return;
        
        const output = outputText.textContent;
        if (!output.trim()) return;
        
        const caseOption = caseToggle.value;
        let transformedText = output;
        
        if (caseOption === 'uppercase') {
            // Only transform SQL keywords
            if (translationMode.value === 'nl_to_sql') {
                transformedText = transformSqlCase(output, true);
            } else {
                transformedText = output;
            }
        } else if (caseOption === 'lowercase') {
            // Only transform SQL keywords
            if (translationMode.value === 'nl_to_sql') {
                transformedText = transformSqlCase(output, false);
            } else {
                transformedText = output;
            }
        }
        
        outputText.textContent = transformedText;
        
        // Reapply syntax highlighting
        if (translationMode.value === 'nl_to_sql' && hljs) {
            hljs.highlightElement(outputText);
        }
    }
    
    function transformSqlCase(sql, toUpperCase) {
        // List of SQL keywords to transform
        const sqlKeywords = [
            'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL',
            'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE',
            'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'VIEW', 'INDEX', 'TRIGGER',
            'PROCEDURE', 'FUNCTION', 'DATABASE', 'SCHEMA', 'GRANT', 'REVOKE', 'COMMIT',
            'ROLLBACK', 'SAVEPOINT', 'TRANSACTION', 'AND', 'OR', 'NOT', 'NULL', 'IS',
            'IN', 'BETWEEN', 'LIKE', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
            'EXISTS', 'ALL', 'ANY', 'SOME', 'UNION', 'INTERSECT', 'EXCEPT', 'DISTINCT'
        ];
        
        let result = sql;
        
        // Create a regular expression that matches SQL keywords
        // but only if they are standalone words (not part of other words)
        const keywordPattern = new RegExp(
            '\\b(' + sqlKeywords.join('|') + ')\\b', 
            'gi'
        );
        
        result = result.replace(keywordPattern, function(match) {
            return toUpperCase ? match.toUpperCase() : match.toLowerCase();
        });
        
        return result;
    }
    
    // History Functions
    function saveToHistory(input, output, mode) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            input: input,
            output: output,
            mode: mode
        };
        
        // Save to local storage
        const history = JSON.parse(localStorage.getItem('queryHistory') || '[]');
        history.unshift(historyItem); // Add to beginning of array
        localStorage.setItem('queryHistory', JSON.stringify(history.slice(0, 50))); // Limit to 50 items
        
        // Also save to server if API is available
        try {
            fetch('/api/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(historyItem)
            }).catch(err => console.log('Could not save to server history:', err));
        } catch (error) {
            console.log('Error saving to server history:', error);
        }
    }
    
    async function loadHistory() {
        if (!historyList) return;
        
        try {
            const response = await fetch('/api/history', {
                method: 'GET'
            });
            const history = JSON.parse(localStorage.getItem('queryHistory') || '[]');
            renderHistoryList(history);
        } catch (error) {
            console.log('Error loading history:', error);
            const history = JSON.parse(localStorage.getItem('queryHistory') || '[]');
            renderHistoryList(history);
        }
    }
    
    function renderHistoryList(history) {
        if (!historyList) return;
        
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyList.innerHTML = '<p>No translation history yet.</p>';
            return;
        }
        
        history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.index = index;
            
            const timestamp = new Date(item.timestamp);
            const formattedDate = timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString();
            
            historyItem.innerHTML = `
                <div class="history-item-header">
                    <span class="history-item-mode">${item.mode === 'nl_to_sql' ? 'NL → SQL' : 'SQL → NL'}</span>
                    <span class="history-item-timestamp">${formattedDate}</span>
                </div>
                <div class="history-item-input">
                    <h4>Input:</h4>
                    <div class="history-item-text">${item.input}</div>
                </div>
                <div class="history-item-output">
                    <h4>Output:</h4>
                    <div class="history-item-text">${item.output}</div>
                </div>
            `;
            
            historyItem.addEventListener('click', () => {
                loadHistoryItem(item);
                closeHistoryModal();
            });
            
            historyList.appendChild(historyItem);
        });
    }
    
    function loadHistoryItem(item) {
        if (!inputText || !outputText || !translationMode) return;
        
        translationMode.value = item.mode;
        updateLabels();
        
        inputText.value = item.input;
        outputText.textContent = item.output;
        
        // Apply syntax highlighting for SQL
        if (item.mode === 'nl_to_sql' && hljs) {
            hljs.highlightElement(outputText);
        }
    }
    
    function openHistoryModal() {
        if (!historyModal) return;
        historyModal.style.display = 'block';
        loadHistory(); // Refresh history when opening modal
    }
    
    function closeHistoryModal() {
        if (!historyModal) return;
        historyModal.style.display = 'none';
    }
    
    async function clearHistory() {
        try {
            const response = await fetch('/api/history/clear', {
                method: 'POST'
            });
            localStorage.removeItem('queryHistory');
            loadHistory();
            showNotification('History cleared', 'success');
        } catch (error) {
            console.log('Error clearing server history:', error);
            localStorage.removeItem('queryHistory');
            loadHistory();
            showNotification('History cleared', 'success');
        }
    }
    
    // Utility Functions
    function showNotification(message, type) {
        // Check if notification container exists, create if not
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.bottom = '20px';
            notificationContainer.style.right = '20px';
            notificationContainer.style.zIndex = '1000';
            document.body.appendChild(notificationContainer);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '4px';
        notification.style.marginTop = '10px';
        notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '0';
        notification.textContent = message;
        
        // Add to container
        notificationContainer.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notificationContainer.removeChild(notification);
            }, 300);
        }, 3000);
    }
});