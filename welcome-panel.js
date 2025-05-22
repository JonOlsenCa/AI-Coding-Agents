const vscode = require('vscode');
const path = require('path');

/**
 * Manages the welcome panel for first-time users
 */
class WelcomePanel {
  /**
   * Create a new welcome panel
   * @param {vscode.ExtensionContext} context - The extension context
   */
  constructor(context) {
    this.context = context;
    this.panel = null;
  }

  /**
   * Show the welcome panel
   */
  show() {
    // If panel already exists, reveal it
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    // Create a new panel
    this.panel = vscode.window.createWebviewPanel(
      'aiAgents.welcome',
      'Welcome to AI Coding Agents',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
        ]
      }
    );

    // Set HTML content
    this.panel.webview.html = this.getWebviewContent();

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'openAgent':
            vscode.commands.executeCommand(`aiAgents.${message.agentType}`);
            break;
          case 'openSettings':
            vscode.commands.executeCommand('workbench.action.openSettings', 'aiAgents');
            break;
          case 'openSidebar':
            vscode.commands.executeCommand('workbench.view.extension.aiAgents');
            break;
          case 'dontShowAgain':
            // Update configuration to not show welcome on startup
            vscode.workspace.getConfiguration('aiAgents').update('showWelcomeOnStartup', false, true);
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
   * Get the HTML content for the webview
   * @returns {string} - The HTML content
   */
  getWebviewContent() {
    // Get the path to the extension's media folder
    const mediaPath = vscode.Uri.file(path.join(this.context.extensionPath, 'media'));
    const mediaUri = this.panel.webview.asWebviewUri(mediaPath);

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AI Coding Agents</title>
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
            .welcome-container {
                max-width: 900px;
                margin: 0 auto;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                width: 128px;
                height: 128px;
                margin-bottom: 20px;
            }
            .section {
                margin-bottom: 30px;
                padding: 20px;
                background-color: var(--vscode-editor-inactiveSelectionBackground);
                border-radius: 6px;
            }
            .feature-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            .feature-card {
                background-color: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                padding: 15px;
            }
            .feature-icon {
                font-size: 24px;
                margin-bottom: 10px;
                color: var(--vscode-textLink-foreground);
            }
            .agent-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }
            .agent-card {
                background-color: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                padding: 15px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .agent-card:hover {
                background-color: var(--vscode-list-hoverBackground);
            }
            .agent-icon {
                font-size: 20px;
                margin-bottom: 10px;
                color: var(--vscode-textLink-foreground);
            }
            .button-container {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-top: 30px;
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
            .checkbox-container {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 20px;
            }
            .checkbox-container input {
                margin-right: 8px;
            }
            .steps {
                list-style-type: decimal;
                padding-left: 20px;
            }
            .steps li {
                margin-bottom: 10px;
            }
            .screenshot {
                max-width: 100%;
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="welcome-container">
            <div class="header">
                <img class="logo" src="${mediaUri}/icon.png" alt="AI Coding Agents Logo">
                <h1>Welcome to AI Coding Agents</h1>
                <p>Your specialized AI assistants for different development roles</p>
            </div>

            <div class="section">
                <h2>Getting Started</h2>
                <ol class="steps">
                    <li>Select an agent from the sidebar or use the status bar icon</li>
                    <li>Ask a question or use one of the specialized actions</li>
                    <li>View the response in the interactive panel</li>
                    <li>Use the generated code in your project</li>
                </ol>
            </div>

            <div class="section">
                <h2>Key Features</h2>
                <div class="feature-grid">
                    <div class="feature-card">
                        <div class="feature-icon">🤖</div>
                        <h3>Specialized Agents</h3>
                        <p>10 AI agents with unique expertise for different development roles</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">💬</div>
                        <h3>Conversation Memory</h3>
                        <p>Agents remember your previous interactions for better context</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🔍</div>
                        <h3>Context-Aware</h3>
                        <p>Agents understand your workspace and current file</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">✨</div>
                        <h3>Agent Actions</h3>
                        <p>Specialized code generation for each agent type</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Available Agents</h2>
                <p>Click on an agent to start a conversation:</p>
                <div class="agent-grid">
                    <div class="agent-card" data-agent="architectureGuardian">
                        <div class="agent-icon"><i class="codicon codicon-symbol-structure"></i></div>
                        <h3>Architecture Guardian</h3>
                    </div>
                    <div class="agent-card" data-agent="databaseSpecialist">
                        <div class="agent-icon"><i class="codicon codicon-database"></i></div>
                        <h3>Database Specialist</h3>
                    </div>
                    <div class="agent-card" data-agent="backendDeveloper">
                        <div class="agent-icon"><i class="codicon codicon-server"></i></div>
                        <h3>Backend Developer</h3>
                    </div>
                    <div class="agent-card" data-agent="frontendDeveloper">
                        <div class="agent-icon"><i class="codicon codicon-browser"></i></div>
                        <h3>Frontend Developer</h3>
                    </div>
                    <div class="agent-card" data-agent="aiIntegrationEngineer">
                        <div class="agent-icon"><i class="codicon codicon-lightbulb"></i></div>
                        <h3>AI Integration Engineer</h3>
                    </div>
                    <div class="agent-card" data-agent="fullStackDebugger">
                        <div class="agent-icon"><i class="codicon codicon-debug"></i></div>
                        <h3>Full-Stack Debugger</h3>
                    </div>
                </div>
            </div>

            <div class="button-container">
                <button id="openSidebar">Open Agents Sidebar</button>
                <button id="openSettings">Configure Settings</button>
            </div>

            <div class="checkbox-container">
                <input type="checkbox" id="dontShowAgain">
                <label for="dontShowAgain">Don't show this welcome page on startup</label>
            </div>
        </div>

        <script>
            (function() {
                const vscode = acquireVsCodeApi();
                
                // Handle agent card clicks
                document.querySelectorAll('.agent-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const agentType = card.getAttribute('data-agent');
                        vscode.postMessage({
                            command: 'openAgent',
                            agentType: agentType
                        });
                    });
                });
                
                // Handle button clicks
                document.getElementById('openSidebar').addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'openSidebar'
                    });
                });
                
                document.getElementById('openSettings').addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'openSettings'
                    });
                });
                
                // Handle checkbox
                document.getElementById('dontShowAgain').addEventListener('change', (e) => {
                    if (e.target.checked) {
                        vscode.postMessage({
                            command: 'dontShowAgain'
                        });
                    }
                });
            })();
        </script>
    </body>
    </html>`;
  }
}

module.exports = WelcomePanel;
