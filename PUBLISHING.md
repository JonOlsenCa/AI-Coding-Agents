# Publishing Guide for AI Coding Agents

This document provides detailed instructions for creating screenshots, recording a demo video, and publishing the AI Coding Agents extension to the VS Code Marketplace.

## Creating Screenshots

Before publishing, you need to create screenshots for the marketplace listing. These screenshots should showcase the key features of the extension.

### Required Screenshots

1. **Agent Panel (agent-panel.png)**
   - Open an agent panel using the command palette
   - Show both the chat and actions tabs
   - Include a sample conversation with code examples
   - Resolution: 1200x800px

2. **Sidebar View (sidebar-view.png)**
   - Show the sidebar with all available agents
   - Hover over one agent to show the tooltip
   - Resolution: 800x1000px

3. **Welcome Experience (welcome-panel.png)**
   - Open the welcome panel using the command palette
   - Show the entire welcome page with features and agent cards
   - Resolution: 1200x800px

4. **Custom Prompts Editor (prompt-editor.png)**
   - Open the prompt editor using the command palette
   - Show the editor with a custom prompt being edited
   - Resolution: 1200x800px

5. **Conversation History View (history-view.png)**
   - Open the history view using the command palette
   - Show the search and filter options
   - Include several conversation entries
   - Resolution: 1200x800px

### How to Create Screenshots

1. Launch VS Code with the extension in debug mode:
   ```
   code --extensionDevelopmentPath=.
   ```

2. Set up each feature as described above

3. Use one of these methods to capture screenshots:
   - Windows: Use the Snipping Tool or Win+Shift+S
   - macOS: Use Cmd+Shift+4 or the Screenshot app
   - Linux: Use the Screenshot tool or a third-party app

4. Save the screenshots in the `screenshots` folder with the appropriate names

5. Optimize the images for web (compress without losing quality)

## Recording a Demo Video

A demo video can significantly increase the appeal of your extension. Follow the demo script in `demo-script.md` to create a professional demonstration.

### Video Recording Tips

1. **Setup**:
   - Use a clean VS Code theme with good contrast
   - Increase font size for better visibility
   - Use a high-quality microphone for narration
   - Record at 1920x1080 resolution

2. **Process**:
   - Follow the demo script step by step
   - Speak clearly and at a moderate pace
   - Keep the video under 5-7 minutes
   - Focus on practical use cases

3. **Tools**:
   - OBS Studio (free, open-source)
   - Camtasia (commercial)
   - ScreenToGif (for short animated GIFs)

4. **Post-Processing**:
   - Add captions for accessibility
   - Include a title screen and outro
   - Add subtle background music if appropriate
   - Export in MP4 format with H.264 encoding

## Publishing to VS Code Marketplace

Follow these steps to publish your extension to the VS Code Marketplace.

### Prerequisites

1. Create a Microsoft account if you don't have one
2. Create an Azure DevOps organization at https://dev.azure.com/
3. Create a Personal Access Token (PAT) with "Marketplace (publish)" scope

### Publishing Process

1. **Login to vsce**:
   ```
   npx vsce login JonOlsen
   ```
   Enter your PAT when prompted

2. **Verify the package**:
   ```
   npx vsce package
   ```
   This creates a .vsix file that you can inspect

3. **Test the package locally**:
   ```
   code --install-extension ai-coding-agents-1.0.0.vsix
   ```
   Test all features to ensure they work correctly

4. **Publish the extension**:
   ```
   npx vsce publish
   ```
   This will publish the extension to the marketplace

5. **Verify the publication**:
   - Go to https://marketplace.visualstudio.com/
   - Search for "AI Coding Agents"
   - Check that all information appears correctly

### Post-Publishing Tasks

1. **Create a GitHub release**:
   - Tag: v1.0.0
   - Title: AI Coding Agents v1.0.0
   - Description: Copy from CHANGELOG.md
   - Attach the .vsix file

2. **Announce the release**:
   - Update the repository README
   - Share on relevant developer communities
   - Consider writing a blog post about the extension

3. **Monitor feedback**:
   - Check ratings and reviews regularly
   - Address issues promptly
   - Plan for future updates based on feedback

## Updating the Extension

For future updates, follow these steps:

1. Make your changes to the codebase
2. Update the version in package.json (follow semver)
3. Update CHANGELOG.md with new changes
4. Create new screenshots if the UI has changed
5. Run `npx vsce package` to test
6. Run `npx vsce publish` to publish the update

## Resources

- [VS Code Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)
- [VS Code Marketplace](https://marketplace.visualstudio.com/manage)
- [Semver Guidelines](https://semver.org/)

## Checklist

Use the detailed checklist in `publishing-checklist.md` to ensure you've completed all necessary steps before publishing.
