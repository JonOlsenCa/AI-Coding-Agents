const assert = require('assert');
const vscode = require('vscode');
const agentPrompts = require('../../agent-prompts');

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Starting all tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('JonOlsen.ai-coding-agents'));
  });

  test('Should register all commands', async () => {
    const commands = await vscode.commands.getCommands();
    
    // Check for main commands
    assert.ok(commands.includes('aiAgents.list'));
    assert.ok(commands.includes('aiAgents.clearMemory'));
    assert.ok(commands.includes('aiAgents.openPanel'));
    
    // Check for agent-specific commands
    assert.ok(commands.includes('aiAgents.architectureGuardian'));
    assert.ok(commands.includes('aiAgents.databaseSpecialist'));
    assert.ok(commands.includes('aiAgents.backendDeveloper'));
    assert.ok(commands.includes('aiAgents.frontendDeveloper'));
    assert.ok(commands.includes('aiAgents.aiIntegrationEngineer'));
    assert.ok(commands.includes('aiAgents.fullStackDebugger'));
    assert.ok(commands.includes('aiAgents.codeReviewer'));
    assert.ok(commands.includes('aiAgents.testingStrategist'));
    assert.ok(commands.includes('aiAgents.pythonDataProcessor'));
    assert.ok(commands.includes('aiAgents.devOpsEngineer'));
  });

  test('All agent prompts should be defined', () => {
    assert.ok(agentPrompts.architectureGuardian);
    assert.ok(agentPrompts.databaseSpecialist);
    assert.ok(agentPrompts.backendDeveloper);
    assert.ok(agentPrompts.frontendDeveloper);
    assert.ok(agentPrompts.aiIntegrationEngineer);
    assert.ok(agentPrompts.fullStackDebugger);
    assert.ok(agentPrompts.codeReviewer);
    assert.ok(agentPrompts.testingStrategist);
    assert.ok(agentPrompts.pythonDataProcessor);
    assert.ok(agentPrompts.devOpsEngineer);
  });
});
