const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

/**
 * Class to manage the history view
 */
class HistoryView {
  /**
   * Create a new history view
   * @param {Object} context - The extension context
   * @param {Object} agentMemory - The agent memory manager
   */
  constructor(context, agentMemory) {
    this.context = context;
    this.agentMemory = agentMemory;
    this.panel = null;
  }

  /**
   * Show the history view
   */
  show() {
    // Create and show panel
    this.panel = vscode.window.createWebviewPanel(
      'historyView',
      'AI Agents: Conversation History',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    // Set the HTML content
    this.updateContent();

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'reuseQuestion':
            this.handleReuseQuestion(message.agentType, message.question);
            break;
          case 'clearHistory':
            this.handleClearHistory(message.agentType);
            break;
          case 'clearAllHistory':
            this.handleClearAllHistory();
            break;
          case 'search':
            this.handleSearch(message.query);
            break;
          case 'filter':
            this.handleFilter(message.agentType);
            break;
        }
      },
      undefined,
      this.context.subscriptions
    );
  }

  /**
   * Update the content of the history view
   */
  updateContent() {
    if (!this.panel) return;
    
    this.panel.webview.html = this.getWebviewContent();
  }

  /**
   * Handle reusing a question
   * @param {string} agentType - The agent type
   * @param {string} question - The question to reuse
   */
  handleReuseQuestion(agentType, question) {
    // Create a command to invoke the agent with the question
    vscode.commands.executeCommand(agentType, question);
  }

  /**
   * Handle clearing history for an agent
   * @param {string} agentType - The agent type
   */
  handleClearHistory(agentType) {
    this.agentMemory.clearConversations(agentType);
    this.updateContent();
    vscode.window.showInformationMessage(`History cleared for ${formatAgentName(agentType)}`);
  }

  /**
   * Handle clearing all history
   */
  handleClearAllHistory() {
    this.agentMemory.clearAllConversations();
    this.updateContent();
    vscode.window.showInformationMessage('All conversation history cleared');
  }

  /**
   * Handle search
   * @param {string} query - The search query
   */
  handleSearch(query) {
    this.searchQuery = query;
    this.updateContent();
  }

  /**
   * Handle filter
   * @param {string} agentType - The agent type to filter by
   */
  handleFilter(agentType) {
    this.filterAgent = agentType === 'all' ? null : agentType;
    this.updateContent();
  }

  /**
   * Get the webview content
   * @returns {string} - The HTML content
   */
  getWebviewContent() {
    // Get all conversations
    let conversations = this.agentMemory.getAllConversations();
    
    // Apply search filter if needed
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      conversations = conversations.filter(conv => 
        conv.userMessage.toLowerCase().includes(query) || 
        conv.agentResponse.toLowerCase().includes(query)
      );
    }
    
    // Apply agent filter if needed
    if (this.filterAgent) {
      conversations = conversations.filter(conv => conv.agentType === this.filterAgent);
    }
    
    // Sort by timestamp (newest first)
    conversations.sort((a, b) => b.timestamp - a.timestamp);
    
    // Get all agent types for the filter dropdown
    const agentTypes = [...new Set(this.agentMemory.getAllConversations().map(conv => conv.agentType))];
    
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Agents: Conversation History</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                padding: 20px;
                color: var(--vscode-foreground);
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            .title {
                font-size: 1.5em;
                font-weight: bold;
            }
            .controls {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }
            .search-box {
                flex-grow: 1;
                padding: 5px;
                border: 1px solid var(--vscode-input-border);
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
            }
            .filter-dropdown {
                padding: 5px;
                border: 1px solid var(--vscode-dropdown-border);
                background-color: var(--vscode-dropdown-background);
                color: var(--vscode-dropdown-foreground);
            }
            button {
                padding: 5px 10px;
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                cursor: pointer;
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            .history-entry {
                margin-bottom: 20px;
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                overflow: hidden;
            }
            .history-header {
                display: flex;
                justify-content: space-between;
                padding: 10px;
                background-color: var(--vscode-editor-inactiveSelectionBackground);
            }
            .agent-name {
                font-weight: bold;
            }
            .timestamp {
                font-size: 0.9em;
                color: var(--vscode-descriptionForeground);
            }
            .history-content {
                padding: 10px;
            }
            .message {
                margin-bottom: 10px;
            }
            .message-label {
                font-weight: bold;
                margin-bottom: 5px;
            }
            .user-message {
                white-space: pre-wrap;
                margin-bottom: 10px;
            }
            .agent-message {
                white-space: pre-wrap;
            }
            .context-info {
                font-size: 0.9em;
                color: var(--vscode-descriptionForeground);
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid var(--vscode-panel-border);
            }
            .history-actions {
                display: flex;
                gap: 10px;
                padding: 10px;
                background-color: var(--vscode-editor-inactiveSelectionBackground);
            }
            .no-history {
                text-align: center;
                padding: 20px;
                color: var(--vscode-descriptionForeground);
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">Conversation History</div>
            <button id="clear-all-button">Clear All History</button>
        </div>
        
        <div class="controls">
            <input type="text" class="search-box" id="search-box" placeholder="Search conversations...">
            <select class="filter-dropdown" id="filter-dropdown">
                <option value="all">All Agents</option>
                ${agentTypes.map(type => `<option value="${type}" ${this.filterAgent === type ? 'selected' : ''}>${formatAgentName(type)}</option>`).join('')}
            </select>
            <button id="search-button">Search</button>
        </div>
        
        <div class="history-container">
            ${conversations.length > 0 ? 
                conversations.map(entry => this.formatHistoryEntry(entry)).join('') : 
                '<div class="no-history">No conversation history found</div>'}
        </div>
        
        <script>
            (function() {
                const vscode = acquireVsCodeApi();
                
                // Search functionality
                document.getElementById('search-button').addEventListener('click', () => {
                    const query = document.getElementById('search-box').value;
                    vscode.postMessage({
                        command: 'search',
                        query: query
                    });
                });
                
                // Enter key in search box
                document.getElementById('search-box').addEventListener('keyup', (e) => {
                    if (e.key === 'Enter') {
                        const query = document.getElementById('search-box').value;
                        vscode.postMessage({
                            command: 'search',
                            query: query
                        });
                    }
                });
                
                // Filter dropdown
                document.getElementById('filter-dropdown').addEventListener('change', (e) => {
                    vscode.postMessage({
                        command: 'filter',
                        agentType: e.target.value
                    });
                });
                
                // Clear all history
                document.getElementById('clear-all-button').addEventListener('click', () => {
                    if (confirm('Are you sure you want to clear all conversation history? This cannot be undone.')) {
                        vscode.postMessage({
                            command: 'clearAllHistory'
                        });
                    }
                });
                
                // Reuse question
                document.querySelectorAll('.reuse-button').forEach(button => {
                    button.addEventListener('click', () => {
                        const agentType = button.getAttribute('data-agent');
                        const question = button.getAttribute('data-message');
                        
                        vscode.postMessage({
                            command: 'reuseQuestion',
                            agentType: agentType,
                            question: question
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
