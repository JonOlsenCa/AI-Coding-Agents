const vscode = require('vscode');
const testExtension = require('../test-extension');

function activate(context) {
  // Register a command to run the tests
  let disposable = vscode.commands.registerCommand('test-runner.runTests', async () => {
    await testExtension.testExtension();
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
