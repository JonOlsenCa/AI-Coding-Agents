// Agent memory management
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class AgentMemory {
  constructor() {
    // Map to store conversation history for each agent
    // Key: agentType, Value: Array of conversation entries
    this.conversations = new Map();
    this.storageUri = null;
    this.historyFilePath = null;

    // Maximum number of conversations to keep in memory
    this.maxConversationsInMemory = 50;

    // Maximum number of conversations to keep in storage
    this.maxConversationsInStorage = 500;
  }

  /**
   * Initialize storage
   * @param {vscode.ExtensionContext} context - The extension context
   */
  initialize(context) {
    this.storageUri = context.globalStorageUri;
    this.historyFilePath = path.join(this.storageUri.fsPath, 'conversation-history.json');

    // Ensure storage directory exists
    this.ensureStorageDirectory();

    // Load conversation history from storage
    this.loadConversationHistory();

    // Update max conversations from settings
    this.updateMaxConversationsFromSettings();

    // Listen for configuration changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('aiAgents.maxConversationHistory') ||
            e.affectsConfiguration('aiAgents.maxStoredConversations')) {
          this.updateMaxConversationsFromSettings();
        }
      })
    );
  }

  /**
   * Update max conversations from settings
   */
  updateMaxConversationsFromSettings() {
    const config = vscode.workspace.getConfiguration('aiAgents');
    this.maxConversationsInMemory = config.get('maxConversationHistory', 50);
    this.maxConversationsInStorage = config.get('maxStoredConversations', 500);
  }

  /**
   * Ensure the storage directory exists
   */
  ensureStorageDirectory() {
    try {
      if (!fs.existsSync(this.storageUri.fsPath)) {
        fs.mkdirSync(this.storageUri.fsPath, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating storage directory:', error);
    }
  }

  /**
   * Load conversation history from storage
   */
  loadConversationHistory() {
    try {
      if (fs.existsSync(this.historyFilePath)) {
        const data = fs.readFileSync(this.historyFilePath, 'utf8');
        const history = JSON.parse(data);

        // Convert to Map
        Object.keys(history).forEach(agentType => {
          this.conversations.set(agentType, history[agentType]);
        });
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  }

  /**
   * Save conversation history to storage
   */
  saveConversationHistory() {
    try {
      // Convert Map to object
      const history = {};
      this.conversations.forEach((conversations, agentType) => {
        // Limit the number of conversations saved to storage
        history[agentType] = conversations.slice(-this.maxConversationsInStorage);
      });

      fs.writeFileSync(this.historyFilePath, JSON.stringify(history, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  }

  /**
   * Add a new conversation entry for an agent
   * @param {string} agentType - The type of agent
   * @param {string} userMessage - The user's message
   * @param {string} agentResponse - The agent's response
   * @param {Object} context - Additional context information
   */
  addConversation(agentType, userMessage, agentResponse, context = {}) {
    if (!this.conversations.has(agentType)) {
      this.conversations.set(agentType, []);
    }

    const conversation = this.conversations.get(agentType);
    const entry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userMessage,
      agentResponse,
      context: {
        fileName: context.fileName || '',
        language: context.language || '',
        ...context
      }
    };

    conversation.push(entry);

    // Limit conversation history in memory
    if (conversation.length > this.maxConversationsInMemory) {
      conversation.splice(0, conversation.length - this.maxConversationsInMemory);
    }

    // Save to storage
    this.saveConversationHistory();
  }

  /**
   * Generate a unique ID for a conversation
   * @returns {string} - A unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Get conversation history for an agent
   * @param {string} agentType - The type of agent
   * @param {number} limit - Maximum number of entries to return
   * @returns {Array} - Array of conversation entries
   */
  getConversationHistory(agentType, limit = 10) {
    if (!this.conversations.has(agentType)) {
      return [];
    }

    const conversations = this.conversations.get(agentType);
    return limit > 0 ? conversations.slice(-limit) : conversations;
  }

  /**
   * Get all conversation history
   * @param {number} limit - Maximum number of entries to return
   * @returns {Array} - Array of conversation entries with agent type
   */
  getAllConversationHistory(limit = 100) {
    const allHistory = [];

    this.conversations.forEach((conversations, agentType) => {
      conversations.forEach(conversation => {
        allHistory.push({
          ...conversation,
          agentType
        });
      });
    });

    // Sort by timestamp (newest first)
    allHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit the number of entries
    return limit > 0 ? allHistory.slice(0, limit) : allHistory;
  }

  /**
   * Search conversation history
   * @param {string} query - Search query
   * @param {Object} filters - Filters to apply
   * @returns {Array} - Array of matching conversation entries
   */
  searchConversationHistory(query, filters = {}) {
    const allHistory = this.getAllConversationHistory(0);

    return allHistory.filter(entry => {
      // Apply text search
      const matchesQuery = !query ||
        entry.userMessage.toLowerCase().includes(query.toLowerCase()) ||
        entry.agentResponse.toLowerCase().includes(query.toLowerCase());

      // Apply agent type filter
      const matchesAgentType = !filters.agentType ||
        entry.agentType === filters.agentType;

      // Apply date filter
      const matchesDateFrom = !filters.dateFrom ||
        new Date(entry.timestamp) >= new Date(filters.dateFrom);

      const matchesDateTo = !filters.dateTo ||
        new Date(entry.timestamp) <= new Date(filters.dateTo);

      // Apply language filter
      const matchesLanguage = !filters.language ||
        entry.context.language === filters.language;

      return matchesQuery && matchesAgentType && matchesDateFrom &&
        matchesDateTo && matchesLanguage;
    });
  }

  /**
   * Clear conversation history for an agent
   * @param {string} agentType - The type of agent
   */
  clearConversationHistory(agentType) {
    this.conversations.set(agentType, []);
    this.saveConversationHistory();
  }

  /**
   * Clear all conversation history
   */
  clearAllConversationHistory() {
    this.conversations.clear();
    this.saveConversationHistory();
  }

  /**
   * Format conversation history for inclusion in prompts
   * @param {string} agentType - The type of agent
   * @param {number} limit - Maximum number of entries to include
   * @returns {string} - Formatted conversation history
   */
  formatConversationHistoryForPrompt(agentType, limit = 10) {
    const history = this.getConversationHistory(agentType, limit);
    if (history.length === 0) return '';

    let formattedHistory = 'Previous conversation:\n\n';
    history.forEach((entry, index) => {
      formattedHistory += `User: ${entry.userMessage}\n`;
      formattedHistory += `Agent: ${entry.agentResponse}\n\n`;
    });

    return formattedHistory;
  }

  /**
   * Get available agent types with conversation history
   * @returns {Array<string>} - Array of agent types
   */
  getAgentTypesWithHistory() {
    return Array.from(this.conversations.keys()).filter(agentType =>
      this.conversations.get(agentType).length > 0
    );
  }

  /**
   * Get available languages in conversation history
   * @returns {Array<string>} - Array of languages
   */
  getLanguagesInHistory() {
    const languages = new Set();

    this.conversations.forEach(conversations => {
      conversations.forEach(entry => {
        if (entry.context && entry.context.language) {
          languages.add(entry.context.language);
        }
      });
    });

    return Array.from(languages);
  }
}

module.exports = new AgentMemory();
