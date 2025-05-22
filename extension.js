const vscode = require('vscode');
const agentPrompts = require('./agent-prompts');
const agentMemory = require('./agent-memory');
const contextGatherer = require('./context-gatherer');
const AgentPanel = require('./agent-panel');
const agentActions = require('./agent-actions');
const AgentSidebar = require('./agent-sidebar');
const WelcomePanel = require('./welcome-panel');
const CustomPrompts = require('./custom-prompts');
const PromptEditor = require('./prompt-editor');
const HistoryView = require('./history-view');

function activate(context) {
  // Register commands for each agent
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

  // Create agent panel manager
  const agentPanelManager = new AgentPanel(context);

  // Create agent sidebar
  const agentSidebar = new AgentSidebar(context);

  // Create welcome panel
  const welcomePanel = new WelcomePanel(context);

  // Create custom prompts manager
  const customPrompts = new CustomPrompts(context);

  // Create prompt editor
  const promptEditor = new PromptEditor(context, customPrompts);

  // Create history view
  const historyView = new HistoryView(context);

  // Initialize agent memory
  agentMemory.initialize(context);

  // Check if we should show the welcome panel
  checkAndShowWelcomePanel(welcomePanel);

  // Create a status bar item for quick access
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = "$(hubot) AI Agents";
  statusBarItem.tooltip = "Select an AI Coding Agent";
  statusBarItem.command = 'aiAgents.list';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register agent commands
  agents.forEach(agent => {
    context.subscriptions.push(
      vscode.commands.registerCommand(`aiAgents.${agent}`, async () => {
        await invokeAgent(agent, agentPanelManager, customPrompts);
      })
    );
  });

  // Register a command to list all available agents
  context.subscriptions.push(
    vscode.commands.registerCommand('aiAgents.list', async () => {
      const agentItems = agents.map(agent => ({
        label: formatAgentName(agent),
        description: getAgentDescription(agent),
        value: agent
      }));

      const selectedAgent = await vscode.window.showQuickPick(agentItems, {
        placeHolder: 'Select an AI coding agent'
      });

      if (selectedAgent) {
        await invokeAgent(selectedAgent.value, agentPanelManager, customPrompts);
      }
    })
  );

  // Register command to clear agent memory
  context.subscriptions.push(
    vscode.commands.registerCommand('aiAgents.clearMemory', async () => {
      const selectedAgent = await vscode.window.showQuickPick(agents.map(agent => ({
        label: formatAgentName(agent),
        value: agent
      })), {
        placeHolder: 'Select an agent to clear conversation history'
      });

      if (selectedAgent) {
        agentMemory.clearConversationHistory(selectedAgent.value);
        vscode.window.showInformationMessage(`Cleared conversation history for ${formatAgentName(selectedAgent.value)}`);
      }
    })
  );

  // Register command to open agent panel
  context.subscriptions.push(
    vscode.commands.registerCommand('aiAgents.openPanel', async () => {
      const selectedAgent = await vscode.window.showQuickPick(agents.map(agent => ({
        label: formatAgentName(agent),
        description: getAgentDescription(agent),
        value: agent
      })), {
        placeHolder: 'Select an agent to open panel'
      });

      if (selectedAgent) {
        const agentName = formatAgentName(selectedAgent.value);
        const panel = agentPanelManager.getOrCreatePanel(selectedAgent.value, agentName);
        agentPanelManager.updateConversationHistory(panel, selectedAgent.value);
      }
    })
  );

  // Register command to show welcome panel
  context.subscriptions.push(
    vscode.commands.registerCommand('aiAgents.showWelcome', () => {
      welcomePanel.show();
    })
  );

  // Register command to edit agent prompt
  context.subscriptions.push(
    vscode.commands.registerCommand('aiAgents.editPrompt', async () => {
      const selectedAgent = await vscode.window.showQuickPick(agents.map(agent => ({
        label: formatAgentName(agent),
        description: customPrompts.hasCustomPrompt(agent) ? 'Custom prompt' : 'Default prompt',
        value: agent
      })), {
        placeHolder: 'Select an agent to edit prompt'
      });

      if (selectedAgent) {
        promptEditor.show(selectedAgent.value);
      }
    })
  );

  // Register command to reset agent prompt
  context.subscriptions.push(
    vscode.commands.registerCommand('aiAgents.resetPrompt', async () => {
      // Get agents with custom prompts
      const agentsWithCustomPrompts = customPrompts.getAgentTypesWithCustomPrompts();

      if (agentsWithCustomPrompts.length === 0) {
        vscode.window.showInformationMessage('No custom prompts to reset.');
        return;
      }

      const selectedAgent = await vscode.window.showQuickPick(agentsWithCustomPrompts.map(agent => ({
        label: formatAgentName(agent),
        value: agent
      })), {
        placeHolder: 'Select an agent to reset prompt'
      });

      if (selectedAgent) {
        customPrompts.resetPrompt(selectedAgent.value);
        vscode.window.showInformationMessage(`Reset to default prompt for ${formatAgentName(selectedAgent.value)}`);
      }
    })
  );

  // Register command to show conversation history
  context.subscriptions.push(
    vscode.commands.registerCommand('aiAgents.showHistory', () => {
      historyView.show();
    })
  );

  // Register command to clear all conversation history
  context.subscriptions.push(
    vscode.commands.registerCommand('aiAgents.clearAllHistory', async () => {
      const confirmation = await vscode.window.showWarningMessage(
        'Are you sure you want to clear all conversation history? This cannot be undone.',
        { modal: true },
        'Yes',
        'No'
      );

      if (confirmation === 'Yes') {
        agentMemory.clearAllConversationHistory();
        vscode.window.showInformationMessage('All conversation history has been cleared.');
      }
    })
  );
}

/**
 * Get a short description for an agent
 * @param {string} agentType - The agent type
 * @returns {string} - A short description
 */
function getAgentDescription(agentType) {
  const descriptions = {
    'architectureGuardian': 'Maintains architectural integrity across system components',
    'databaseSpecialist': 'Optimizes data storage, retrieval, and integrity',
    'backendDeveloper': 'Ensures robust and efficient backend implementation',
    'frontendDeveloper': 'Creates responsive and intuitive user interfaces',
    'aiIntegrationEngineer': 'Implements effective and secure AI capabilities',
    'fullStackDebugger': 'Troubleshoots issues across multiple system layers',
    'codeReviewer': 'Ensures code quality and adherence to best practices',
    'testingStrategist': 'Designs comprehensive testing strategies',
    'pythonDataProcessor': 'Optimizes data manipulation and analysis pipelines',
    'devOpsEngineer': 'Ensures reliable deployment and operation'
  };

  return descriptions[agentType] || '';
}

/**
 * Invoke an AI agent with the user's question
 * @param {string} agentType - The type of agent to invoke
 * @param {AgentPanel} agentPanelManager - The agent panel manager
 * @param {CustomPrompts} customPrompts - The custom prompts manager
 */
async function invokeAgent(agentType, agentPanelManager, customPrompts) {
  try {
    // Get user's question
    const userQuestion = await vscode.window.showInputBox({
      placeHolder: `Ask the ${formatAgentName(agentType)} a question...`,
      prompt: `What would you like to ask the ${formatAgentName(agentType)}?`
    });

    if (!userQuestion) return;

    // Get the selected model
    const [model] = await vscode.lm.selectChatModels({
      vendor: 'copilot',
      family: 'gpt-4'
    });

    if (!model) {
      vscode.window.showErrorMessage('No language model available. Please ensure you have Copilot installed.');
      return;
    }

    // Get user settings
    const config = vscode.workspace.getConfiguration('aiAgents');
    const useWebviewPanel = config.get('useWebviewPanel', true);
    const includeWorkspaceContext = config.get('includeWorkspaceContext', true);

    // Gather context information if enabled
    let contextString = '';
    if (includeWorkspaceContext) {
      const context = await contextGatherer.gatherFullContext();

      // Format context information
      if (context.hasActiveEditor) {
        contextString += `Current file: ${context.fileContext}\n`;
        contextString += `Language: ${context.fileLanguage}\n`;

        if (context.selectedCode) {
          contextString += `Selected code:\n\`\`\`${context.fileLanguage}\n${context.selectedCode}\n\`\`\`\n\n`;
        }
      }

      if (context.hasWorkspace) {
        contextString += `Project: ${context.projectName || context.workspaceName}\n`;
        if (context.projectDescription) {
          contextString += `Description: ${context.projectDescription}\n`;
        }

        if (context.relevantFiles.length > 0) {
          contextString += `\nRelevant files in the project:\n`;
          context.relevantFiles.forEach(file => {
            contextString += `- ${file}\n`;
          });
          contextString += '\n';
        }
      }
    }

    // Get conversation history
    const conversationHistory = agentMemory.formatConversationHistoryForPrompt(agentType);

    // Get custom prompts setting
    const useCustomPrompts = config.get('useCustomPrompts', true);

    // Get the appropriate prompt (custom or default)
    let systemPrompt;
    if (useCustomPrompts && customPrompts.hasCustomPrompt(agentType)) {
      systemPrompt = customPrompts.getPrompt(agentType);
    } else {
      systemPrompt = agentPrompts[agentType];
    }

    // Create the prompt
    const prompt = [
      new vscode.LanguageModelChatSystemMessage(systemPrompt),
      new vscode.LanguageModelChatUserMessage(
        `${conversationHistory ? conversationHistory + '\n' : ''}${contextString}${userQuestion}`
      )
    ];

    const agentName = formatAgentName(agentType);

    // Create output channel or use webview panel based on settings
    let outputChannel;
    let panel;

    if (useWebviewPanel) {
      panel = agentPanelManager.getOrCreatePanel(agentType, agentName);
    } else {
      outputChannel = vscode.window.createOutputChannel(`AI Agent: ${agentName}`);
      outputChannel.show();
      outputChannel.appendLine(`Question: ${userQuestion}\n`);
      outputChannel.appendLine('Thinking...\n');
    }

    // Send the request
    const request = model.sendRequest(prompt, {}, new vscode.CancellationTokenSource().token);

    // Process the response
    let response = '';
    for await (const fragment of request.text) {
      response += fragment;

      // Update the output based on the selected interface
      if (useWebviewPanel) {
        // Panel updates will happen after the full response
      } else {
        // Clear and update the output channel
        outputChannel.clear();
        outputChannel.appendLine(`Question: ${userQuestion}\n`);
        outputChannel.appendLine(`${agentName} says:\n${response}`);
      }
    }

    // Get context information for history
    const contextInfo = {
      fileName: activeEditor ? activeEditor.document.fileName : '',
      language: activeEditor ? activeEditor.document.languageId : '',
      workspaceFolders: vscode.workspace.workspaceFolders ?
        vscode.workspace.workspaceFolders.map(folder => folder.name) : []
    };

    // Store the conversation with context
    agentMemory.addConversation(agentType, userQuestion, response, contextInfo);

    // Update the panel if using webview
    if (useWebviewPanel && panel) {
      agentPanelManager.updateConversationHistory(panel, agentType);
    }

  } catch (err) {
    if (err instanceof vscode.LanguageModelError) {
      vscode.window.showErrorMessage(`AI error: ${err.message}`);
    } else {
      vscode.window.showErrorMessage(`Error: ${err.message}`);
    }
  }
}

function formatAgentName(camelCaseName) {
  return camelCaseName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
}

/**
 * Check if we should show the welcome panel and show it if needed
 * @param {WelcomePanel} welcomePanel - The welcome panel instance
 */
async function checkAndShowWelcomePanel(welcomePanel) {
  // Get configuration
  const config = vscode.workspace.getConfiguration('aiAgents');
  const showWelcomeOnStartup = config.get('showWelcomeOnStartup', true);
  const hasShownWelcome = config.get('hasShownWelcome', false);

  // Show welcome panel if it's the first time or if explicitly enabled
  if (showWelcomeOnStartup && !hasShownWelcome) {
    // Set the flag to indicate we've shown the welcome panel
    await config.update('hasShownWelcome', true, vscode.ConfigurationTarget.Global);

    // Show the welcome panel after a short delay to allow VS Code to finish loading
    setTimeout(() => {
      welcomePanel.show();
    }, 1000);
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};