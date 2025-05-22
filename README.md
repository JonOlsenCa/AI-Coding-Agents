# AI Coding Agents for VS Code

<p align="center">
  <img src="https://raw.githubusercontent.com/JonOlsenCa/AI-Coding-Agents/main/media/icon.png" width="128" height="128" alt="AI Coding Agents Icon">
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=JonOlsen.ai-coding-agents">
    <img src="https://img.shields.io/visual-studio-marketplace/v/JonOlsen.ai-coding-agents?color=blue&label=VS%20Code%20Marketplace" alt="VS Code Marketplace Version">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=JonOlsen.ai-coding-agents">
    <img src="https://img.shields.io/visual-studio-marketplace/i/JonOlsen.ai-coding-agents?color=blue" alt="VS Code Marketplace Installs">
  </a>
  <a href="https://github.com/JonOlsenCa/AI-Coding-Agents/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/JonOlsenCa/AI-Coding-Agents?color=blue" alt="License">
  </a>
</p>

This extension provides specialized AI coding agents for different development roles in your tech stack. Each agent has expertise in a specific area and can help you with tasks related to that domain.

## Features

- 🤖 **10 Specialized AI Agents** - Each with unique expertise and focus
- 💬 **Conversation Memory** - Agents remember your previous interactions
- 🔍 **Context-Aware** - Agents understand your workspace and current file
- 🖥️ **Interactive UI** - Choose between webview panels or output channels
- 🔧 **Customizable** - Configure agent behavior through settings
- ✨ **Agent Actions** - Specialized code generation for each agent type
- 📝 **Code Generation** - Generate components, APIs, tests, and more
- 👋 **Welcome Experience** - Helpful onboarding for first-time users
- 🔄 **Custom Prompts** - Personalize agent behavior with custom system prompts
- 📜 **History View** - Browse, search, and filter past conversations

## Requirements

- VS Code 1.90.0 or higher
- GitHub Copilot subscription

## Available Agents

- **Architecture Guardian**: Focuses on system-wide design and cross-component impacts
- **Database Specialist**: MS SQL Server optimization and schema design
- **Backend Developer**: C# service implementation and optimization
- **Frontend Developer**: Quasar/Vue.js component development
- **AI Integration Engineer**: OpenAI API implementation and prompt engineering
- **Full-Stack Debugger**: Cross-component troubleshooting
- **Code Reviewer**: Quality assurance and best practices enforcement
- **Testing Strategist**: Comprehensive test planning and implementation
- **Python Data Processor**: Data manipulation and analysis
- **DevOps Engineer**: CI/CD and operational infrastructure

## Usage

### Quick Access via Sidebar

The extension adds an AI Coding Agents icon to the activity bar. Click it to:

1. See all available agents in the sidebar
2. Click on an agent to start a conversation
3. Use the action buttons to open the agent panel or start a chat

### Asking Questions

1. Open the Command Palette (Ctrl+Shift+P)
2. Type "AI Agents" to see all available commands
3. Select an agent or use "Select an Agent" to choose from a list
4. Enter your question when prompted
5. View the agent's response in the output panel or webview

You can also select code in your editor before invoking an agent to provide context for your question.

### Using Agent Actions

Each agent has specialized actions for code generation and analysis:

1. Open an agent panel using the Command Palette
2. Click the "Actions" tab
3. Select an action (e.g., "Generate Component" for Frontend Developer)
4. Provide a description or select code in your editor
5. View the generated code and insert it into your editor

## Extension Settings

This extension contributes the following settings:

* `aiAgents.useWebviewPanel`: Use webview panel for agent interactions instead of output channel (default: true)
* `aiAgents.includeWorkspaceContext`: Include workspace context information in agent prompts (default: true)
* `aiAgents.maxConversationHistory`: Maximum number of conversation entries to keep in memory (default: 50)
* `aiAgents.maxStoredConversations`: Maximum number of conversation entries to keep in storage (default: 500)
* `aiAgents.enableCodeGeneration`: Enable code generation capabilities for agents (default: true)
* `aiAgents.defaultLanguage`: Default language for code generation when not specified (default: "javascript")
* `aiAgents.showWelcomeOnStartup`: Show welcome page when the extension is activated for the first time (default: true)
* `aiAgents.useCustomPrompts`: Use custom prompts when available instead of default prompts (default: true)

## Commands

* `AI Agents: Select an Agent` - Choose from the list of available agents
* `AI Agents: Clear Agent Memory` - Clear conversation history for an agent
* `AI Agents: Open Agent Panel` - Open the interactive panel for an agent
* `AI Agents: Show Welcome Page` - Display the welcome and onboarding information
* `AI Agents: Edit Agent Prompt` - Customize the system prompt for an agent
* `AI Agents: Reset Agent Prompt to Default` - Restore an agent's default system prompt
* `AI Agents: Show Conversation History` - Browse, search, and filter past conversations
* `AI Agents: Clear All Conversation History` - Delete all stored conversation history
* Individual commands for each agent (e.g., `AI Agents: Architecture Guardian`)

## Extension Development

To build and run this extension locally:

1. Clone the repository
2. Run `npm install`
3. Press F5 to start debugging

### Project Structure

- `extension.js` - Main extension code
- `agent-prompts.js` - System prompts for each agent
- `agent-memory.js` - Conversation history management
- `context-gatherer.js` - Workspace context gathering
- `agent-panel.js` - WebView panel implementation
- `agent-sidebar.js` - Sidebar view implementation
- `agent-actions.js` - Specialized actions for each agent
- `welcome-panel.js` - Welcome and onboarding experience
- `custom-prompts.js` - Custom prompts management
- `prompt-editor.js` - Prompt editing interface
- `history-view.js` - Conversation history browsing

## Roadmap

- Add more specialized agents for different domains
- Enhance code generation capabilities with more templates
- Add export/import functionality for conversation history
- Implement conversation tagging and categorization
- Integrate with other VS Code features (e.g., tasks, debugging)
- Add support for additional language models

## Screenshots

### Agent Panel with Chat and Actions
![Agent Panel](https://raw.githubusercontent.com/JonOlsenCa/AI-Coding-Agents/main/screenshots/agent-panel.png)

### Sidebar View
![Sidebar View](https://raw.githubusercontent.com/JonOlsenCa/AI-Coding-Agents/main/screenshots/sidebar-view.png)

### Welcome Experience
![Welcome Experience](https://raw.githubusercontent.com/JonOlsenCa/AI-Coding-Agents/main/screenshots/welcome-panel.png)

### Custom Prompts Editor
![Custom Prompts](https://raw.githubusercontent.com/JonOlsenCa/AI-Coding-Agents/main/screenshots/prompt-editor.png)

### Conversation History View
![History View](https://raw.githubusercontent.com/JonOlsenCa/AI-Coding-Agents/main/screenshots/history-view.png)

## License

[MIT](LICENSE)