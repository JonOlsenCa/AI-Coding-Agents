const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const agentPrompts = require('./agent-prompts');

/**
 * Manages custom prompts for agents
 */
class CustomPrompts {
  constructor(context) {
    this.context = context;
    this.customPrompts = new Map();
    this.storageUri = context.globalStorageUri;
    this.promptsFilePath = path.join(this.storageUri.fsPath, 'custom-prompts.json');
    
    // Ensure storage directory exists
    this.ensureStorageDirectory();
    
    // Load custom prompts
    this.loadCustomPrompts();
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
   * Load custom prompts from storage
   */
  loadCustomPrompts() {
    try {
      if (fs.existsSync(this.promptsFilePath)) {
        const data = fs.readFileSync(this.promptsFilePath, 'utf8');
        const prompts = JSON.parse(data);
        
        // Convert to Map
        Object.keys(prompts).forEach(agentType => {
          this.customPrompts.set(agentType, prompts[agentType]);
        });
      }
    } catch (error) {
      console.error('Error loading custom prompts:', error);
    }
  }

  /**
   * Save custom prompts to storage
   */
  saveCustomPrompts() {
    try {
      // Convert Map to object
      const prompts = {};
      this.customPrompts.forEach((prompt, agentType) => {
        prompts[agentType] = prompt;
      });
      
      fs.writeFileSync(this.promptsFilePath, JSON.stringify(prompts, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving custom prompts:', error);
      vscode.window.showErrorMessage('Failed to save custom prompts: ' + error.message);
    }
  }

  /**
   * Get prompt for an agent
   * @param {string} agentType - The type of agent
   * @returns {string} - The prompt
   */
  getPrompt(agentType) {
    // Return custom prompt if it exists, otherwise return default prompt
    return this.customPrompts.has(agentType) 
      ? this.customPrompts.get(agentType) 
      : agentPrompts[agentType];
  }

  /**
   * Set custom prompt for an agent
   * @param {string} agentType - The type of agent
   * @param {string} prompt - The custom prompt
   */
  setPrompt(agentType, prompt) {
    this.customPrompts.set(agentType, prompt);
    this.saveCustomPrompts();
  }

  /**
   * Reset custom prompt for an agent to default
   * @param {string} agentType - The type of agent
   */
  resetPrompt(agentType) {
    if (this.customPrompts.has(agentType)) {
      this.customPrompts.delete(agentType);
      this.saveCustomPrompts();
    }
  }

  /**
   * Check if an agent has a custom prompt
   * @param {string} agentType - The type of agent
   * @returns {boolean} - True if the agent has a custom prompt
   */
  hasCustomPrompt(agentType) {
    return this.customPrompts.has(agentType);
  }

  /**
   * Get all agent types with custom prompts
   * @returns {Array<string>} - Array of agent types
   */
  getAgentTypesWithCustomPrompts() {
    return Array.from(this.customPrompts.keys());
  }

  /**
   * Get default prompt for an agent
   * @param {string} agentType - The type of agent
   * @returns {string} - The default prompt
   */
  getDefaultPrompt(agentType) {
    return agentPrompts[agentType];
  }
}

module.exports = CustomPrompts;
