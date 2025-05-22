const vscode = require('vscode');

async function testExtension() {
  try {
    // Test the aiAgents.list command
    console.log('Testing aiAgents.list command...');
    await vscode.commands.executeCommand('aiAgents.list');
    console.log('aiAgents.list command executed successfully');

    // Test the aiAgents.showWelcome command
    console.log('Testing aiAgents.showWelcome command...');
    await vscode.commands.executeCommand('aiAgents.showWelcome');
    console.log('aiAgents.showWelcome command executed successfully');

    // Test the aiAgents.showHistory command
    console.log('Testing aiAgents.showHistory command...');
    await vscode.commands.executeCommand('aiAgents.showHistory');
    console.log('aiAgents.showHistory command executed successfully');

    console.log('All tests completed successfully');
  } catch (error) {
    console.error('Error testing extension:', error);
  }
}

module.exports = {
  testExtension
};
