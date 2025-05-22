const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

/**
 * Provides specialized actions for different agent types
 */
class AgentActions {
  constructor() {
    // Map of agent types to their specialized actions
    this.actionMap = {
      'architectureGuardian': [
        { id: 'generateComponentDiagram', label: 'Generate Component Diagram', handler: this.generateComponentDiagram },
        { id: 'analyzeArchitecture', label: 'Analyze Architecture', handler: this.analyzeArchitecture }
      ],
      'databaseSpecialist': [
        { id: 'optimizeQuery', label: 'Optimize SQL Query', handler: this.optimizeQuery },
        { id: 'generateSchema', label: 'Generate Database Schema', handler: this.generateSchema }
      ],
      'backendDeveloper': [
        { id: 'generateEndpoint', label: 'Generate API Endpoint', handler: this.generateEndpoint },
        { id: 'implementService', label: 'Implement Service', handler: this.implementService }
      ],
      'frontendDeveloper': [
        { id: 'generateComponent', label: 'Generate UI Component', handler: this.generateComponent },
        { id: 'implementStyles', label: 'Implement Styles', handler: this.implementStyles }
      ],
      'aiIntegrationEngineer': [
        { id: 'generatePrompt', label: 'Generate Prompt Template', handler: this.generatePrompt },
        { id: 'implementAIService', label: 'Implement AI Service', handler: this.implementAIService }
      ],
      'fullStackDebugger': [
        { id: 'analyzeError', label: 'Analyze Error', handler: this.analyzeError },
        { id: 'generateTestCase', label: 'Generate Test Case', handler: this.generateTestCase }
      ],
      'codeReviewer': [
        { id: 'reviewCode', label: 'Review Code', handler: this.reviewCode },
        { id: 'suggestImprovements', label: 'Suggest Improvements', handler: this.suggestImprovements }
      ],
      'testingStrategist': [
        { id: 'generateTestPlan', label: 'Generate Test Plan', handler: this.generateTestPlan },
        { id: 'implementUnitTest', label: 'Implement Unit Test', handler: this.implementUnitTest }
      ],
      'pythonDataProcessor': [
        { id: 'generateDataPipeline', label: 'Generate Data Pipeline', handler: this.generateDataPipeline },
        { id: 'optimizeDataProcessing', label: 'Optimize Data Processing', handler: this.optimizeDataProcessing }
      ],
      'devOpsEngineer': [
        { id: 'generateWorkflow', label: 'Generate CI/CD Workflow', handler: this.generateWorkflow },
        { id: 'optimizeDeployment', label: 'Optimize Deployment', handler: this.optimizeDeployment }
      ]
    };
  }

  /**
   * Get available actions for an agent type
   * @param {string} agentType - The type of agent
   * @returns {Array} - Array of action objects
   */
  getActionsForAgent(agentType) {
    return this.actionMap[agentType] || [];
  }

  /**
   * Execute an action for an agent
   * @param {string} agentType - The type of agent
   * @param {string} actionId - The ID of the action to execute
   * @param {Object} context - Context information for the action
   * @returns {Promise<any>} - Result of the action
   */
  async executeAction(agentType, actionId, context) {
    const actions = this.getActionsForAgent(agentType);
    const action = actions.find(a => a.id === actionId);
    
    if (!action) {
      throw new Error(`Action ${actionId} not found for agent ${agentType}`);
    }
    
    return await action.handler(context);
  }

  /**
   * Generate code based on a template and context
   * @param {string} templateType - The type of template to use
   * @param {Object} context - Context information for code generation
   * @returns {Promise<string>} - Generated code
   */
  async generateCode(templateType, context) {
    // Get the selected model
    const [model] = await vscode.lm.selectChatModels({
      vendor: 'copilot',
      family: 'gpt-4'
    });

    if (!model) {
      throw new Error('No language model available');
    }

    // Create a prompt based on the template type
    let systemPrompt = '';
    let userPrompt = '';

    switch (templateType) {
      case 'component':
        systemPrompt = 'You are an expert UI component developer. Generate clean, maintainable component code.';
        userPrompt = `Create a ${context.framework || 'React'} component for ${context.description}. Use TypeScript and follow best practices.`;
        break;
      case 'api':
        systemPrompt = 'You are an expert API developer. Generate clean, secure API endpoint code.';
        userPrompt = `Create a ${context.language || 'C#'} API endpoint for ${context.description}. Include proper error handling and validation.`;
        break;
      case 'test':
        systemPrompt = 'You are an expert in test-driven development. Generate comprehensive test code.';
        userPrompt = `Create ${context.testType || 'unit'} tests for ${context.description} using ${context.framework || 'Jest'}.`;
        break;
      case 'schema':
        systemPrompt = 'You are an expert database designer. Generate optimized database schema code.';
        userPrompt = `Create a database schema for ${context.description} using ${context.dbType || 'SQL Server'}.`;
        break;
      default:
        systemPrompt = 'You are an expert software developer. Generate clean, maintainable code.';
        userPrompt = `Create code for ${context.description} using ${context.language || 'JavaScript'}.`;
    }

    // Add any selected code as context
    if (context.selectedCode) {
      userPrompt += `\n\nHere is the existing code to work with:\n\`\`\`\n${context.selectedCode}\n\`\`\``;
    }

    // Create the prompt
    const prompt = [
      new vscode.LanguageModelChatSystemMessage(systemPrompt),
      new vscode.LanguageModelChatUserMessage(userPrompt)
    ];

    // Send the request
    const request = model.sendRequest(prompt, {}, new vscode.CancellationTokenSource().token);
    
    // Process the response
    let response = '';
    for await (const fragment of request.text) {
      response += fragment;
    }
    
    return response;
  }

  /**
   * Insert generated code into the active editor
   * @param {string} code - The code to insert
   * @returns {Promise<boolean>} - Success status
   */
  async insertGeneratedCode(code) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error('No active editor');
    }

    // Extract code block if the response contains markdown code blocks
    const codeBlockRegex = /```(?:\w+)?\s*([\s\S]+?)```/;
    const match = code.match(codeBlockRegex);
    const codeToInsert = match ? match[1].trim() : code;

    // Insert the code at the current selection
    return await editor.edit(editBuilder => {
      if (editor.selection.isEmpty) {
        editBuilder.insert(editor.selection.active, codeToInsert);
      } else {
        editBuilder.replace(editor.selection, codeToInsert);
      }
    });
  }

  // Architecture Guardian actions
  async generateComponentDiagram(context) {
    const code = await this.generateCode('diagram', {
      ...context,
      description: 'a component diagram showing the system architecture'
    });
    return code;
  }

  async analyzeArchitecture(context) {
    // Implementation will be added
    return 'Architecture analysis will be implemented';
  }

  // Database Specialist actions
  async optimizeQuery(context) {
    const code = await this.generateCode('sql', {
      ...context,
      description: 'an optimized SQL query'
    });
    return code;
  }

  async generateSchema(context) {
    const code = await this.generateCode('schema', {
      ...context,
      description: 'a database schema'
    });
    return code;
  }

  // Backend Developer actions
  async generateEndpoint(context) {
    const code = await this.generateCode('api', {
      ...context,
      description: 'a RESTful API endpoint'
    });
    return code;
  }

  async implementService(context) {
    const code = await this.generateCode('service', {
      ...context,
      description: 'a service implementation'
    });
    return code;
  }

  // Frontend Developer actions
  async generateComponent(context) {
    const code = await this.generateCode('component', {
      ...context,
      description: 'a UI component'
    });
    return code;
  }

  async implementStyles(context) {
    const code = await this.generateCode('styles', {
      ...context,
      description: 'CSS/SCSS styles'
    });
    return code;
  }

  // AI Integration Engineer actions
  async generatePrompt(context) {
    const code = await this.generateCode('prompt', {
      ...context,
      description: 'an AI prompt template'
    });
    return code;
  }

  async implementAIService(context) {
    const code = await this.generateCode('aiService', {
      ...context,
      description: 'an AI service integration'
    });
    return code;
  }

  // Full-Stack Debugger actions
  async analyzeError(context) {
    // Implementation will be added
    return 'Error analysis will be implemented';
  }

  async generateTestCase(context) {
    const code = await this.generateCode('test', {
      ...context,
      description: 'a test case to reproduce the issue'
    });
    return code;
  }

  // Code Reviewer actions
  async reviewCode(context) {
    // Implementation will be added
    return 'Code review will be implemented';
  }

  async suggestImprovements(context) {
    // Implementation will be added
    return 'Code improvement suggestions will be implemented';
  }

  // Testing Strategist actions
  async generateTestPlan(context) {
    const code = await this.generateCode('testPlan', {
      ...context,
      description: 'a comprehensive test plan'
    });
    return code;
  }

  async implementUnitTest(context) {
    const code = await this.generateCode('test', {
      ...context,
      description: 'unit tests',
      testType: 'unit'
    });
    return code;
  }

  // Python Data Processor actions
  async generateDataPipeline(context) {
    const code = await this.generateCode('dataPipeline', {
      ...context,
      description: 'a data processing pipeline',
      language: 'Python'
    });
    return code;
  }

  async optimizeDataProcessing(context) {
    const code = await this.generateCode('dataOptimization', {
      ...context,
      description: 'optimized data processing code',
      language: 'Python'
    });
    return code;
  }

  // DevOps Engineer actions
  async generateWorkflow(context) {
    const code = await this.generateCode('workflow', {
      ...context,
      description: 'a CI/CD workflow'
    });
    return code;
  }

  async optimizeDeployment(context) {
    const code = await this.generateCode('deployment', {
      ...context,
      description: 'optimized deployment configuration'
    });
    return code;
  }
}

module.exports = new AgentActions();
