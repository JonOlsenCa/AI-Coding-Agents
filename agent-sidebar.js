const vscode = require('vscode');
const path = require('path');

/**
 * Manages the sidebar view for quick access to agents
 */
class AgentSidebar {
  /**
   * Create a new agent sidebar
   * @param {vscode.ExtensionContext} context - The extension context
   */
  constructor(context) {
    this.context = context;
    this.view = null;
    
    // Register the sidebar view provider
    this.registerViewProvider();
  }
  
  /**
   * Register the sidebar view provider
   */
  registerViewProvider() {
    // Register the view provider
    const provider = new AgentSidebarProvider(this.context);
    
    this.context.subscriptions.push(
      vscode.window.registerWebviewViewProvider('aiAgents.sidebar', provider)
    );
  }
}

/**
 * Provider for the agent sidebar view
 */
class AgentSidebarProvider {
  /**
   * Create a new agent sidebar provider
   * @param {vscode.ExtensionContext} context - The extension context
   */
  constructor(context) {
    this.context = context;
  }
  
  /**
   * Resolve the webview view
   * @param {vscode.WebviewView} webviewView - The webview view
   */
  resolveWebviewView(webviewView) {
    this.webviewView = webviewView;
    
    // Set options for the webview
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
      ]
    };
    
    // Set the HTML content
    webviewView.webview.html = this.getHtmlContent();
    
    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'openAgent':
            vscode.commands.executeCommand(`aiAgents.${message.agentType}`);
            break;
          case 'openAgentPanel':
            vscode.commands.executeCommand('aiAgents.openPanel', message.agentType);
            break;
        }
      },
      undefined,
      this.context.subscriptions
    );
  }
  
  /**
   * Get the HTML content for the webview
   * @returns {string} - The HTML content
   */
  getHtmlContent() {
    const agents = [
      { type: 'architectureGuardian', name: 'Architecture Guardian', icon: 'symbol-structure' },
      { type: 'databaseSpecialist', name: 'Database Specialist', icon: 'database' },
      { type: 'backendDeveloper', name: 'Backend Developer', icon: 'server' },
      { type: 'frontendDeveloper', name: 'Frontend Developer', icon: 'browser' },
      { type: 'aiIntegrationEngineer', name: 'AI Integration Engineer', icon: 'lightbulb' },
      { type: 'fullStackDebugger', name: 'Full-Stack Debugger', icon: 'debug' },
      { type: 'codeReviewer', name: 'Code Reviewer', icon: 'checklist' },
      { type: 'testingStrategist', name: 'Testing Strategist', icon: 'beaker' },
      { type: 'pythonDataProcessor', name: 'Python Data Processor', icon: 'graph' },
      { type: 'devOpsEngineer', name: 'DevOps Engineer', icon: 'server-process' }
    ];
    
    const agentListItems = agents.map(agent => `
      <div class="agent-item" data-agent="${agent.type}">
        <div class="agent-icon"><i class="codicon codicon-${agent.icon}"></i></div>
        <div class="agent-name">${agent.name}</div>
        <div class="agent-actions">
          <button class="action-button chat" title="Chat with agent" data-agent="${agent.type}">
            <i class="codicon codicon-comment"></i>
          </button>
          <button class="action-button panel" title="Open agent panel" data-agent="${agent.type}">
            <i class="codicon codicon-window"></i>
          </button>
        </div>
      </div>
    `).join('');
    
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Coding Agents</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                padding: 0;
                margin: 0;
                color: var(--vscode-foreground);
            }
            .container {
                padding: 10px;
            }
            .header {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            }
            .header h2 {
                margin: 0;
                font-size: 1.2em;
            }
            .agent-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .agent-item {
                display: flex;
                align-items: center;
                padding: 8px;
                border-radius: 4px;
                background-color: var(--vscode-editor-background);
                cursor: pointer;
            }
            .agent-item:hover {
                background-color: var(--vscode-list-hoverBackground);
            }
            .agent-icon {
                margin-right: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
            }
            .agent-name {
                flex: 1;
                font-size: 0.9em;
            }
            .agent-actions {
                display: flex;
                gap: 4px;
            }
            .action-button {
                background: none;
                border: none;
                color: var(--vscode-button-foreground);
                cursor: pointer;
                padding: 2px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 2px;
                opacity: 0.7;
            }
            .action-button:hover {
                opacity: 1;
                background-color: var(--vscode-button-hoverBackground);
            }
        </style>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vscode-codicons/dist/codicon.css" />
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>AI Coding Agents</h2>
            </div>
            <div class="agent-list">
                ${agentListItems}
            </div>
        </div>

        <script>
            (function() {
                const vscode = acquireVsCodeApi();
                
                // Handle agent item clicks
                document.querySelectorAll('.agent-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const agentType = item.getAttribute('data-agent');
                        vscode.postMessage({
                            command: 'openAgent',
                            agentType: agentType
                        });
                    });
                });
                
                // Handle chat button clicks
                document.querySelectorAll('.action-button.chat').forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const agentType = button.getAttribute('data-agent');
                        vscode.postMessage({
                            command: 'openAgent',
                            agentType: agentType
                        });
                    });
                });
                
                // Handle panel button clicks
                document.querySelectorAll('.action-button.panel').forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const agentType = button.getAttribute('data-agent');
                        vscode.postMessage({
                            command: 'openAgentPanel',
                            agentType: agentType
                        });
                    });
                });
            })();
        </script>
    </body>
    </html>`;
  }
}

module.exports = AgentSidebar;
