const vscode = require('vscode');
const path = require('path');
const agentMemory = require('./agent-memory');

/**
 * Manages the history view panel
 */
class HistoryView {
  /**
   * Create a new history view
   * @param {vscode.ExtensionContext} context - The extension context
   */
  constructor(context) {
    this.context = context;
    this.panel = null;
  }

  /**
   * Show the history view panel
   */
  show() {
    // If panel already exists, reveal it
    if (this.panel) {
      this.panel.reveal();
      this.updateContent();
      return;
    }

    // Create a new panel
    this.panel = vscode.window.createWebviewPanel(
      'aiAgents.historyView',
      'AI Agent Conversation History',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
        ]
      }
    );

    // Set initial HTML content
    this.updateContent();

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage(
      async message => {
        switch (message.command) {
          case 'search':
            this.updateContent(message.query, message.filters);
            break;
          case 'clearHistory':
            if (message.agentType) {
              agentMemory.clearConversationHistory(message.agentType);
              vscode.window.showInformationMessage(`Cleared history for ${formatAgentName(message.agentType)}`);
            } else {
              agentMemory.clearAllConversationHistory();
              vscode.window.showInformationMessage('Cleared all conversation history');
            }
            this.updateContent();
            break;
          case 'reuse':
            // Reuse a conversation by opening the agent with the same question
            if (message.agentType && message.userMessage) {
              vscode.commands.executeCommand(`aiAgents.${message.agentType}`, message.userMessage);
            }
            break;
        }
      },
      undefined,
      this.context.subscriptions
    );

    // Handle panel disposal
    this.panel.onDidDispose(
      () => {
        this.panel = null;
      },
      null,
      this.context.subscriptions
    );
  }

  /**
   * Update the panel content
   * @param {string} query - Search query
   * @param {Object} filters - Filters to apply
   */
  updateContent(query = '', filters = {}) {
    if (!this.panel) return;
    
    this.panel.webview.html = this.getWebviewContent(query, filters);
  }

  /**
   * Get the HTML content for the webview
   * @param {string} query - Search query
   * @param {Object} filters - Filters to apply
   * @returns {string} - The HTML content
   */
  getWebviewContent(query = '', filters = {}) {
    // Get conversation history
    const history = query || Object.keys(filters).length > 0
      ? agentMemory.searchConversationHistory(query, filters)
      : agentMemory.getAllConversationHistory();
    
    // Get available agent types and languages for filters
    const agentTypes = agentMemory.getAgentTypesWithHistory();
    const languages = agentMemory.getLanguagesInHistory();
    
    // Format agent options
    const agentOptions = agentTypes.map(agent => 
      `<option value="${agent}" ${filters.agentType === agent ? 'selected' : ''}>${formatAgentName(agent)}</option>`
    ).join('');
    
    // Format language options
    const languageOptions = languages.map(language => 
      `<option value="${language}" ${filters.language === language ? 'selected' : ''}>${language}</option>`
    ).join('');
    
    // Format conversation history
    const historyHtml = history.length > 0
      ? history.map(entry => this.formatHistoryEntry(entry)).join('')
      : '<div class="empty-state">No conversation history found</div>';

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Agent Conversation History</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
                padding: 20px;
                line-height: 1.5;
            }
            h1, h2, h3 {
                color: var(--vscode-editor-foreground);
                font-weight: 600;
            }
            .history-container {
                max-width: 1000px;
                margin: 0 auto;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            .search-container {
                background-color: var(--vscode-editor-inactiveSelectionBackground);
                padding: 15px;
                border-radius: 6px;
                margin-bottom: 20px;
            }
            .search-row {
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
            }
            .search-input {
                flex: 1;
                padding: 5px 10px;
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
                border-radius: 2px;
            }
            .filter-row {
                display: flex;
                gap: 10px;
            }
            .filter-group {
                flex: 1;
            }
            .filter-label {
                display: block;
                margin-bottom: 5px;
                font-size: 12px;
            }
            .filter-select {
                width: 100%;
                padding: 5px;
                background-color: var(--vscode-dropdown-background);
                color: var(--vscode-dropdown-foreground);
                border: 1px solid var(--vscode-dropdown-border);
                border-radius: 2px;
            }
            .filter-date {
                width: 100%;
                padding: 5px;
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
                border-radius: 2px;
            }
            .button-container {
                display: flex;
                justify-content: space-between;
                margin-top: 10px;
            }
            button {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 6px 12px;
                border-radius: 2px;
                cursor: pointer;
                font-size: 13px;
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            .history-entry {
                background-color: var(--vscode-editor-inactiveSelectionBackground);
                border-radius: 6px;
                margin-bottom: 15px;
                overflow: hidden;
            }
            .history-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background-color: var(--vscode-editor-selectionBackground);
                font-size: 13px;
            }
            .agent-name {
                font-weight: bold;
            }
            .timestamp {
                color: var(--vscode-descriptionForeground);
                font-size: 12px;
            }
            .history-content {
                padding: 15px;
            }
            .message {
                margin-bottom: 15px;
            }
            .message-label {
                font-weight: bold;
                margin-bottom: 5px;
            }
            .user-message {
                background-color: var(--vscode-editor-background);
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 10px;
            }
            .agent-message {
                background-color: var(--vscode-editor-background);
                padding: 10px;
                border-radius: 4px;
                white-space: pre-wrap;
            }
            .context-info {
                margin-top: 10px;
                font-size: 12px;
                color: var(--vscode-descriptionForeground);
            }
            .history-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 0 15px 15px;
            }
            .empty-state {
                text-align: center;
                padding: 40px;
                color: var(--vscode-descriptionForeground);
                font-style: italic;
            }
            .danger-button {
                background-color: var(--vscode-errorForeground);
            }
            .danger-button:hover {
                opacity: 0.9;
            }
        </style>
    </head>
    <body>
        <div class="history-container">
            <div class="header">
                <h1>AI Agent Conversation History</h1>
            </div>

            <div class="search-container">
                <div class="search-row">
                    <input type="text" id="searchInput" class="search-input" placeholder="Search conversations..." value="${escapeHtml(query)}">
                    <button id="searchButton">Search</button>
                </div>
                <div class="filter-row">
                    <div class="filter-group">
                        <label class="filter-label">Agent Type</label>
                        <select id="agentFilter" class="filter-select">
                            <option value="">All Agents</option>
                            ${agentOptions}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label class="filter-label">Language</label>
                        <select id="languageFilter" class="filter-select">
                            <option value="">All Languages</option>
                            ${languageOptions}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label class="filter-label">From Date</label>
                        <input type="date" id="dateFromFilter" class="filter-date" value="${filters.dateFrom || ''}">
                    </div>
                    <div class="filter-group">
                        <label class="filter-label">To Date</label>
                        <input type="date" id="dateToFilter" class="filter-date" value="${filters.dateTo || ''}">
                    </div>
                </div>
                <div class="button-container">
                    <div>
                        <button id="clearFiltersButton">Clear Filters</button>
                    </div>
                    <div>
                        <button id="clearHistoryButton" class="danger-button">Clear All History</button>
                    </div>
                </div>
            </div>

            <div class="history-list">
                ${historyHtml}
            </div>
        </div>

        <script>
            (function() {
                const vscode = acquireVsCodeApi();
                const searchInput = document.getElementById('searchInput');
                const searchButton = document.getElementById('searchButton');
                const agentFilter = document.getElementById('agentFilter');
                const languageFilter = document.getElementById('languageFilter');
                const dateFromFilter = document.getElementById('dateFromFilter');
                const dateToFilter = document.getElementById('dateToFilter');
                const clearFiltersButton = document.getElementById('clearFiltersButton');
                const clearHistoryButton = document.getElementById('clearHistoryButton');
                
                // Search function
                function search() {
                    const query = searchInput.value.trim();
                    const filters = {
                        agentType: agentFilter.value,
                        language: languageFilter.value,
                        dateFrom: dateFromFilter.value,
                        dateTo: dateToFilter.value
                    };
                    
                    vscode.postMessage({
                        command: 'search',
                        query: query,
                        filters: filters
                    });
                }
                
                // Search button click
                searchButton.addEventListener('click', search);
                
                // Search on Enter key
                searchInput.addEventListener('keyup', (e) => {
                    if (e.key === 'Enter') {
                        search();
                    }
                });
                
                // Filter changes
                agentFilter.addEventListener('change', search);
                languageFilter.addEventListener('change', search);
                dateFromFilter.addEventListener('change', search);
                dateToFilter.addEventListener('change', search);
                
                // Clear filters
                clearFiltersButton.addEventListener('click', () => {
                    searchInput.value = '';
                    agentFilter.value = '';
                    languageFilter.value = '';
                    dateFromFilter.value = '';
                    dateToFilter.value = '';
                    search();
                });
                
                // Clear history
                clearHistoryButton.addEventListener('click', () => {
                    if (confirm('Are you sure you want to clear all conversation history? This cannot be undone.')) {
                        vscode.postMessage({
                            command: 'clearHistory'
                        });
                    }
                });
                
                // Reuse conversation
                document.querySelectorAll('.reuse-button').forEach(button => {
                    button.addEventListener('click', () => {
                        const agentType = button.getAttribute('data-agent');
                        const userMessage = button.getAttribute('data-message');
                        
                        vscode.postMessage({
                            command: 'reuse',
                            agentType: agentType,
                            userMessage: userMessage
                        });
                    });
                });
                
                // Clear agent history
                document.querySelectorAll('.clear-button').forEach(button => {
                    button.addEventListener('click', () => {
                        const agentType = button.getAttribute('data-agent');
                        const agentName = button.getAttribute('data-agent-name');
                        
                        if (confirm(`Are you sure you want to clear all history for ${agentName}? This cannot be undone.`)) {
                            vscode.postMessage({
                                command: 'clearHistory',
                                agentType: agentType
                            });
                        }
                    });
                });
            })();
        </script>
    </body>
    </html>`;
  }

  /**
   * Format a history entry as HTML
   * @param {Object} entry - The history entry
   * @returns {string} - The HTML representation
   */
  formatHistoryEntry(entry) {
    const timestamp = new Date(entry.timestamp).toLocaleString();
    const agentName = formatAgentName(entry.agentType);
    
    // Format context information
    let contextInfo = '';
    if (entry.context) {
      if (entry.context.fileName) {
        contextInfo += `File: ${entry.context.fileName}`;
      }
      if (entry.context.language) {
        contextInfo += contextInfo ? ` | Language: ${entry.context.language}` : `Language: ${entry.context.language}`;
      }
    }
    
    return `
    <div class="history-entry">
        <div class="history-header">
            <div class="agent-name">${agentName}</div>
            <div class="timestamp">${timestamp}</div>
        </div>
        <div class="history-content">
            <div class="message">
                <div class="message-label">User:</div>
                <div class="user-message">${escapeHtml(entry.userMessage)}</div>
            </div>
            <div class="message">
                <div class="message-label">Agent:</div>
                <div class="agent-message">${escapeHtml(entry.agentResponse)}</div>
            </div>
            ${contextInfo ? `<div class="context-info">${contextInfo}</div>` : ''}
        </div>
        <div class="history-actions">
            <button class="reuse-button" data-agent="${entry.agentType}" data-message="${escapeHtml(entry.userMessage)}">Reuse Question</button>
            <button class="clear-button" data-agent="${entry.agentType}" data-agent-name="${agentName}">Clear ${agentName} History</button>
        </div>
    </div>`;
  }
}

/**
 * Format agent name from camelCase to Title Case
 * @param {string} camelCaseName - The camelCase name
 * @returns {string} - The formatted name
 */
function formatAgentName(camelCaseName) {
  return camelCaseName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
}

/**
 * Escape HTML special characters
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = HistoryView;
