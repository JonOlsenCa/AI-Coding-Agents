const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

/**
 * Gathers context from the workspace for providing to agents
 */
class ContextGatherer {
  /**
   * Get context from the current editor
   * @returns {Object} Context information
   */
  async getEditorContext() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return { 
        hasActiveEditor: false,
        selectedCode: '',
        fileContext: '',
        fileLanguage: ''
      };
    }

    const selection = editor.selection;
    const selectedCode = !selection.isEmpty 
      ? editor.document.getText(selection) 
      : '';
    
    return {
      hasActiveEditor: true,
      selectedCode,
      fileContext: editor.document.fileName,
      fileLanguage: editor.document.languageId,
      fileContent: selectedCode || editor.document.getText()
    };
  }

  /**
   * Get project structure information
   * @returns {Object} Project structure information
   */
  async getProjectStructure() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return { hasWorkspace: false };
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const packageJsonPath = path.join(rootPath, 'package.json');
    
    let projectInfo = {
      hasWorkspace: true,
      rootPath,
      workspaceName: workspaceFolders[0].name,
    };

    // Check for package.json
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        projectInfo.projectName = packageJson.name;
        projectInfo.projectDescription = packageJson.description;
        projectInfo.projectType = 'JavaScript/Node.js';
      } catch (error) {
        console.error('Error parsing package.json:', error);
      }
    }

    return projectInfo;
  }

  /**
   * Get relevant files based on the current context
   * @param {string} fileExtension - File extension to look for
   * @param {number} maxFiles - Maximum number of files to return
   * @returns {Array} Array of file paths
   */
  async getRelevantFiles(fileExtension = '', maxFiles = 5) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return [];

    const rootPath = workspaceFolders[0].uri.fsPath;
    
    // Use VS Code's built-in file search
    const filePattern = fileExtension ? `**/*.${fileExtension}` : '**/*.*';
    const files = await vscode.workspace.findFiles(
      filePattern, 
      '**/node_modules/**', 
      maxFiles
    );
    
    return files.map(file => file.fsPath.replace(rootPath, ''));
  }

  /**
   * Combine all context information
   * @returns {Object} Combined context
   */
  async gatherFullContext() {
    const editorContext = await this.getEditorContext();
    const projectStructure = await this.getProjectStructure();
    
    // Get relevant files based on current file type
    let relevantFiles = [];
    if (editorContext.hasActiveEditor && editorContext.fileLanguage) {
      const fileExtension = this.getExtensionFromLanguage(editorContext.fileLanguage);
      relevantFiles = await this.getRelevantFiles(fileExtension);
    }

    return {
      ...editorContext,
      ...projectStructure,
      relevantFiles
    };
  }

  /**
   * Convert VS Code language ID to file extension
   * @param {string} languageId - VS Code language ID
   * @returns {string} File extension
   */
  getExtensionFromLanguage(languageId) {
    const languageMap = {
      'javascript': 'js',
      'typescript': 'ts',
      'python': 'py',
      'csharp': 'cs',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'markdown': 'md'
    };

    return languageMap[languageId] || '';
  }
}

module.exports = new ContextGatherer();
