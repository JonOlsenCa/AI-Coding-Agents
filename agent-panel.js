const vscode = require('vscode');
const path = require('path');
const agentMemory = require('./agent-memory');
const agentActions = require('./agent-actions');

/**
 * Manages WebView panels for agent interactions
 */
class AgentPanel {
  constructor(context) {
    this.context = context;
    this.panels = new Map();
  }

  /**
   * Get or create a panel for an agent
   * @param {string} agentType - The type of agent
   * @param {string} agentName - The formatted name of the agent
   * @returns {vscode.WebviewPanel} - The panel
   */
  getOrCreatePanel(agentType, agentName) {
    if (this.panels.has(agentType)) {
      const panel = this.panels.get(agentType);
      panel.reveal();
      return panel;
    }

    // Create a new panel
    const panel = vscode.window.createWebviewPanel(
      `aiAgent.${agentType}`,
      `AI Agent: ${agentName}`,
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
        ]
      }
    );

    // Set initial HTML content
    panel.webview.html = this.getWebviewContent(agentType, agentName);

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
      async message => {
        switch (message.command) {
          case 'sendQuestion':
            // Handle sending a question to the agent
            vscode.commands.executeCommand(`aiAgents.${agentType}`, message.text);
            break;
          case 'clearHistory':
            // Clear conversation history
            agentMemory.clearConversationHistory(agentType);
            this.updateConversationHistory(panel, agentType);
            break;
          case 'executeAction':
            // Execute an agent action
            try {
              const context = await this.getActionContext();
              const result = await agentActions.executeAction(agentType, message.actionId, context);
              panel.webview.postMessage({
                command: 'actionResult',
                result: result
              });
            } catch (error) {
              panel.webview.postMessage({
                command: 'actionResult',
                result: `Error: ${error.message}`
              });
            }
            break;
          case 'insertCode':
            // Insert code into the active editor
            try {
              await agentActions.insertGeneratedCode(message.code);
              vscode.window.showInformationMessage('Code inserted successfully');
            } catch (error) {
              vscode.window.showErrorMessage(`Failed to insert code: ${error.message}`);
            }
            break;
          case 'copyCode':
            // Copy code to clipboard
            vscode.env.clipboard.writeText(message.code);
            vscode.window.showInformationMessage('Code copied to clipboard');
            break;
        }
      },
      undefined,
      this.context.subscriptions
    );

    // Handle panel disposal
    panel.onDidDispose(
      () => {
        this.panels.delete(agentType);
      },
      null,
      this.context.subscriptions
    );

    this.panels.set(agentType, panel);
    return panel;
  }

  /**
   * Update the conversation history in the panel
   * @param {vscode.WebviewPanel} panel - The panel to update
   * @param {string} agentType - The type of agent
   */
  updateConversationHistory(panel, agentType) {
    const history = agentMemory.getConversationHistory(agentType);
    panel.webview.postMessage({
      command: 'updateHistory',
      history
    });
  }

  /**
   * Get context information for agent actions
   * @returns {Object} - Context information
   */
  async getActionContext() {
    const editor = vscode.window.activeTextEditor;
    let context = {
      hasActiveEditor: false,
      selectedCode: '',
      language: '',
      description: ''
    };

    if (editor) {
      const selection = editor.selection;
      const selectedCode = !selection.isEmpty
        ? editor.document.getText(selection)
        : '';

      context = {
        hasActiveEditor: true,
        selectedCode,
        language: editor.document.languageId,
        fileName: editor.document.fileName
      };
    }

    // Ask for a description if no code is selected
    if (!context.selectedCode) {
      const description = await vscode.window.showInputBox({
        prompt: 'Please provide a brief description of what you want to generate',
        placeHolder: 'E.g., "A login form component", "A database schema for users", etc.'
      });

      if (description) {
        context.description = description;
      }
    }

    return context;
  }

  /**
   * Get the HTML content for the webview
   * @param {string} agentType - The type of agent
   * @param {string} agentName - The formatted name of the agent
   * @returns {string} - The HTML content
   */
  getWebviewContent(agentType, agentName) {
    // Get available actions for this agent
    const actions = agentActions.getActionsForAgent(agentType);
    const actionButtons = actions.map(action =>
      `<button class="action-button" data-action-id="${action.id}">${action.label}</button>`
    ).join('');

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Agent: ${agentName}</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                padding: 0;
                margin: 0;
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
            }
            .container {
                display: flex;
                flex-direction: column;
                height: 100vh;
                padding: 10px;
                box-sizing: border-box;
            }
            .header {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            .header h1 {
                margin: 0;
                font-size: 1.5em;
            }
            .conversation {
                flex: 1;
                overflow-y: auto;
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                padding: 10px;
                margin-bottom: 10px;
            }
            .message {
                margin-bottom: 15px;
            }
            .user-message {
                background-color: var(--vscode-editor-inactiveSelectionBackground);
                padding: 8px 12px;
                border-radius: 4px;
                margin-left: 20px;
            }
            .agent-message {
                background-color: var(--vscode-editor-selectionBackground);
                padding: 8px 12px;
                border-radius: 4px;
                margin-right: 20px;
            }
            .input-area {
                display: flex;
                margin-top: 10px;
            }
            .input-area textarea {
                flex: 1;
                padding: 8px;
                border: 1px solid var(--vscode-input-border);
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border-radius: 4px;
                resize: none;
                min-height: 60px;
            }
            .input-area button {
                margin-left: 10px;
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 0 15px;
                border-radius: 4px;
                cursor: pointer;
            }
            .input-area button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            .actions {
                display: flex;
                justify-content: space-between;
                margin-top: 5px;
                margin-bottom: 10px;
            }
            .actions button {
                background: none;
                border: none;
                color: var(--vscode-textLink-foreground);
                cursor: pointer;
                font-size: 0.9em;
                padding: 2px 5px;
            }
            .actions button:hover {
                text-decoration: underline;
            }
            .action-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 10px;
            }
            .action-button {
                background-color: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9em;
            }
            .action-button:hover {
                background-color: var(--vscode-button-secondaryHoverBackground);
            }
            pre {
                background-color: var(--vscode-textCodeBlock-background);
                padding: 10px;
                border-radius: 4px;
                overflow-x: auto;
            }
            code {
                font-family: var(--vscode-editor-font-family);
                font-size: var(--vscode-editor-font-size);
            }
            .tabs {
                display: flex;
                margin-bottom: 10px;
            }
            .tab {
                padding: 8px 16px;
                cursor: pointer;
                border-bottom: 2px solid transparent;
            }
            .tab.active {
                border-bottom: 2px solid var(--vscode-textLink-activeForeground);
                font-weight: bold;
            }
            .tab-content {
                display: none;
            }
            .tab-content.active {
                display: block;
            }
            .code-actions {
                display: flex;
                justify-content: flex-end;
                margin-top: 5px;
            }
            .code-actions button {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 4px 8px;
                border-radius: 2px;
                cursor: pointer;
                font-size: 0.8em;
                margin-left: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>AI Agent: ${agentName}</h1>
            </div>

            <div class="tabs">
                <div class="tab active" data-tab="chat">Chat</div>
                <div class="tab" data-tab="actions">Actions</div>
            </div>

            <div class="tab-content active" data-tab-content="chat">
                <div class="conversation" id="conversation">
                    <!-- Conversation history will be inserted here -->
                </div>
                <div class="actions">
                    <div></div>
                    <button id="clearHistory">Clear History</button>
                </div>
                <div class="input-area">
                    <textarea id="questionInput" placeholder="Ask a question..."></textarea>
                    <button id="sendButton">Send</button>
                </div>
            </div>

            <div class="tab-content" data-tab-content="actions">
                <div class="action-buttons">
                    ${actionButtons}
                </div>
                <div id="actionResult" class="conversation">
                    <div class="message">Select an action to get started.</div>
                </div>
                <div class="code-actions" id="codeActions" style="display: none;">
                    <button id="insertCode">Insert Code</button>
                    <button id="copyCode">Copy to Clipboard</button>
                </div>
            </div>
        </div>

        <script>
            (function() {
                const vscode = acquireVsCodeApi();
                const conversationElement = document.getElementById('conversation');
                const questionInput = document.getElementById('questionInput');
                const sendButton = document.getElementById('sendButton');
                const clearHistoryButton = document.getElementById('clearHistory');
                const actionResultElement = document.getElementById('actionResult');
                const codeActionsElement = document.getElementById('codeActions');
                const insertCodeButton = document.getElementById('insertCode');
                const copyCodeButton = document.getElementById('copyCode');
                const tabs = document.querySelectorAll('.tab');
                const tabContents = document.querySelectorAll('.tab-content');

                let currentActionResult = '';

                // Tab switching
                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        const tabName = tab.getAttribute('data-tab');

                        // Update active tab
                        tabs.forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');

                        // Update active content
                        tabContents.forEach(content => {
                            if (content.getAttribute('data-tab-content') === tabName) {
                                content.classList.add('active');
                            } else {
                                content.classList.remove('active');
                            }
                        });
                    });
                });

                // Handle sending a question
                function sendQuestion() {
                    const text = questionInput.value.trim();
                    if (text) {
                        vscode.postMessage({
                            command: 'sendQuestion',
                            text: text
                        });
                        questionInput.value = '';
                    }
                }

                // Event listeners
                sendButton.addEventListener('click', sendQuestion);
                questionInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendQuestion();
                    }
                });

                clearHistoryButton.addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'clearHistory'
                    });
                });

                // Action buttons
                document.querySelectorAll('.action-button').forEach(button => {
                    button.addEventListener('click', () => {
                        const actionId = button.getAttribute('data-action-id');
                        actionResultElement.innerHTML = '<div class="message">Processing action...</div>';
                        codeActionsElement.style.display = 'none';

                        vscode.postMessage({
                            command: 'executeAction',
                            actionId: actionId
                        });

                        // Switch to actions tab if not already there
                        tabs.forEach(tab => {
                            if (tab.getAttribute('data-tab') === 'actions') {
                                tab.click();
                            }
                        });
                    });
                });

                // Code action buttons
                insertCodeButton.addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'insertCode',
                        code: currentActionResult
                    });
                });

                copyCodeButton.addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'copyCode',
                        code: currentActionResult
                    });
                });

                // Handle messages from the extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'updateHistory':
                            updateConversationHistory(message.history);
                            break;
                        case 'actionResult':
                            updateActionResult(message.result);
                            currentActionResult = message.result;
                            codeActionsElement.style.display = 'flex';
                            break;
                    }
                });

                // Update the conversation history
                function updateConversationHistory(history) {
                    conversationElement.innerHTML = '';

                    if (history.length === 0) {
                        conversationElement.innerHTML = '<div class="message">No conversation history yet. Ask a question to get started.</div>';
                        return;
                    }

                    history.forEach(entry => {
                        // Add user message
                        const userDiv = document.createElement('div');
                        userDiv.className = 'message';
                        userDiv.innerHTML = '<div class="user-message">' + escapeHtml(entry.userMessage) + '</div>';
                        conversationElement.appendChild(userDiv);

                        // Add agent message with markdown formatting
                        const agentDiv = document.createElement('div');
                        agentDiv.className = 'message';
                        agentDiv.innerHTML = '<div class="agent-message">' + formatMarkdown(entry.agentResponse) + '</div>';
                        conversationElement.appendChild(agentDiv);
                    });

                    // Scroll to bottom
                    conversationElement.scrollTop = conversationElement.scrollHeight;
                }

                // Update action result
                function updateActionResult(result) {
                    actionResultElement.innerHTML = '<div class="message"><div class="agent-message">' + formatMarkdown(result) + '</div></div>';
                }

                // Format markdown (simple version)
                function formatMarkdown(text) {
                    // Simple formatting without regex
                    let formatted = text;

                    // Replace line breaks
                    formatted = formatted.split('\n').join('<br>');

                    return formatted;
                }

                // Escape HTML
                function escapeHtml(text) {
                    return text
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                }
            })();
        </script>
    </body>
    </html>`;
  }
}

module.exports = AgentPanel;
