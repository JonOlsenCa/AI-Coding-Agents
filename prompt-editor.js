const vscode = require('vscode');
const path = require('path');

/**
 * Manages the prompt editor panel
 */
class PromptEditor {
  /**
   * Create a new prompt editor
   * @param {vscode.ExtensionContext} context - The extension context
   * @param {CustomPrompts} customPrompts - The custom prompts manager
   */
  constructor(context, customPrompts) {
    this.context = context;
    this.customPrompts = customPrompts;
    this.panel = null;
    this.currentAgentType = null;
  }

  /**
   * Show the prompt editor panel
   * @param {string} agentType - The type of agent to edit prompt for
   */
  show(agentType) {
    this.currentAgentType = agentType;

    // If panel already exists, reveal it
    if (this.panel) {
      this.panel.reveal();
      this.updateContent();
      return;
    }

    // Create a new panel
    this.panel = vscode.window.createWebviewPanel(
      'aiAgents.promptEditor',
      'AI Agent Prompt Editor',
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
          case 'savePrompt':
            this.customPrompts.setPrompt(this.currentAgentType, message.prompt);
            vscode.window.showInformationMessage(`Custom prompt saved for ${formatAgentName(this.currentAgentType)}`);
            break;
          case 'resetPrompt':
            this.customPrompts.resetPrompt(this.currentAgentType);
            this.updateContent();
            vscode.window.showInformationMessage(`Reset to default prompt for ${formatAgentName(this.currentAgentType)}`);
            break;
          case 'changeAgent':
            this.currentAgentType = message.agentType;
            this.updateContent();
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
   */
  updateContent() {
    if (!this.panel) return;
    
    this.panel.title = `AI Agent Prompt Editor: ${formatAgentName(this.currentAgentType)}`;
    this.panel.webview.html = this.getWebviewContent();
  }

  /**
   * Get the HTML content for the webview
   * @returns {string} - The HTML content
   */
  getWebviewContent() {
    const agents = [
      'architectureGuardian',
      'databaseSpecialist',
      'backendDeveloper',
      'frontendDeveloper',
      'aiIntegrationEngineer',
      'fullStackDebugger',
      'codeReviewer',
      'testingStrategist',
      'pythonDataProcessor',
      'devOpsEngineer'
    ];

    const currentPrompt = this.customPrompts.getPrompt(this.currentAgentType);
    const defaultPrompt = this.customPrompts.getDefaultPrompt(this.currentAgentType);
    const hasCustomPrompt = this.customPrompts.hasCustomPrompt(this.currentAgentType);

    const agentOptions = agents.map(agent => 
      `<option value="${agent}" ${agent === this.currentAgentType ? 'selected' : ''}>${formatAgentName(agent)}</option>`
    ).join('');

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Agent Prompt Editor</title>
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
            .editor-container {
                max-width: 900px;
                margin: 0 auto;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            .agent-selector {
                padding: 5px;
                background-color: var(--vscode-dropdown-background);
                color: var(--vscode-dropdown-foreground);
                border: 1px solid var(--vscode-dropdown-border);
                border-radius: 2px;
            }
            .prompt-textarea {
                width: 100%;
                height: 400px;
                padding: 10px;
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
                border-radius: 4px;
                font-family: var(--vscode-editor-font-family);
                font-size: var(--vscode-editor-font-size);
                resize: vertical;
            }
            .button-container {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
            }
            button {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 8px 16px;
                border-radius: 2px;
                cursor: pointer;
                font-size: 14px;
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            .status {
                margin-top: 10px;
                font-style: italic;
                color: var(--vscode-descriptionForeground);
            }
            .custom-badge {
                background-color: var(--vscode-badge-background);
                color: var(--vscode-badge-foreground);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 12px;
                margin-left: 10px;
            }
        </style>
    </head>
    <body>
        <div class="editor-container">
            <div class="header">
                <h1>AI Agent Prompt Editor</h1>
                <select id="agentSelector" class="agent-selector">
                    ${agentOptions}
                </select>
            </div>

            <p>Edit the system prompt for the selected agent. This defines the agent's personality, expertise, and behavior.</p>
            
            <div class="status">
                ${hasCustomPrompt 
                  ? `<span>Using custom prompt <span class="custom-badge">Custom</span></span>` 
                  : `<span>Using default prompt</span>`}
            </div>

            <textarea id="promptTextarea" class="prompt-textarea">${escapeHtml(currentPrompt)}</textarea>

            <div class="button-container">
                <button id="resetButton">Reset to Default</button>
                <button id="saveButton">Save Custom Prompt</button>
            </div>
        </div>

        <script>
            (function() {
                const vscode = acquireVsCodeApi();
                const promptTextarea = document.getElementById('promptTextarea');
                const saveButton = document.getElementById('saveButton');
                const resetButton = document.getElementById('resetButton');
                const agentSelector = document.getElementById('agentSelector');
                
                // Save prompt
                saveButton.addEventListener('click', () => {
                    const prompt = promptTextarea.value;
                    vscode.postMessage({
                        command: 'savePrompt',
                        prompt: prompt
                    });
                });
                
                // Reset prompt
                resetButton.addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'resetPrompt'
                    });
                });
                
                // Change agent
                agentSelector.addEventListener('change', () => {
                    vscode.postMessage({
                        command: 'changeAgent',
                        agentType: agentSelector.value
                    });
                });
            })();
        </script>
    </body>
    </html>`;
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

module.exports = PromptEditor;
