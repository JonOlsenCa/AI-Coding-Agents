# VS Code Extension Publishing Checklist

This checklist covers all the steps required to publish the AI Coding Agents extension to the VS Code Marketplace.

## Pre-Publishing Verification

### Documentation

- [ ] README.md is complete and up-to-date
- [ ] Screenshots are included and referenced correctly
- [ ] CHANGELOG.md is updated with the latest version
- [ ] LICENSE file is present
- [ ] All commands and settings are documented

### Metadata

- [ ] package.json has correct version number (1.0.0)
- [ ] package.json includes all required fields:
  - [ ] name
  - [ ] displayName
  - [ ] description
  - [ ] version
  - [ ] publisher
  - [ ] repository
  - [ ] license
  - [ ] engines
  - [ ] categories
  - [ ] keywords
- [ ] Icon is present and referenced correctly
- [ ] Categories and keywords are appropriate

### Code Quality

- [ ] All features work as expected
- [ ] No console errors or warnings
- [ ] Code is properly formatted
- [ ] No unused code or commented-out sections
- [ ] Error handling is implemented

### Assets

- [ ] Screenshots are created and placed in the screenshots folder
- [ ] Icon is optimized and properly sized (at least 128x128)
- [ ] Demo video is recorded (optional but recommended)

### Configuration

- [ ] .vscodeignore is configured to exclude unnecessary files
- [ ] activationEvents are properly defined
- [ ] contributes section is complete and accurate
- [ ] dependencies are properly listed

## Publishing Process

### Preparation

1. [ ] Install the vsce tool if not already installed:
   ```
   npm install -g @vscode/vsce
   ```

2. [ ] Login to Azure DevOps to get a Personal Access Token (PAT):
   - Go to https://dev.azure.com/
   - Create a new organization if needed
   - Generate a PAT with "Marketplace (publish)" scope

3. [ ] Login to vsce with your PAT:
   ```
   vsce login JonOlsen
   ```

### Testing the Package

1. [ ] Create a package without publishing:
   ```
   vsce package
   ```

2. [ ] Verify the .vsix file was created

3. [ ] Install the package locally to test:
   ```
   code --install-extension ai-coding-agents-1.0.0.vsix
   ```

4. [ ] Test all features in a clean VS Code window

5. [ ] Uninstall the test extension:
   ```
   code --uninstall-extension JonOlsen.ai-coding-agents
   ```

### Publishing

1. [ ] Publish the extension:
   ```
   vsce publish
   ```

2. [ ] Verify the extension appears in the marketplace:
   - Go to https://marketplace.visualstudio.com/
   - Search for "AI Coding Agents"
   - Check that all information appears correctly

### Post-Publishing

1. [ ] Create a GitHub release with the same version number
   - Tag: v1.0.0
   - Title: AI Coding Agents v1.0.0
   - Description: Copy from CHANGELOG.md

2. [ ] Announce the release on relevant channels:
   - GitHub repository
   - Social media
   - Developer communities

3. [ ] Monitor initial feedback and ratings

4. [ ] Address any immediate issues with a patch release if necessary

## Version Update Process

For future updates, follow these steps:

1. [ ] Update the version in package.json (follow semver)
2. [ ] Update CHANGELOG.md with new changes
3. [ ] Test all features
4. [ ] Run `vsce publish`
5. [ ] Create a new GitHub release

## Troubleshooting

### Common Publishing Issues

- **Error: Missing required field**: Check package.json for missing required fields
- **Error: No access to publisher**: Verify your PAT has the correct permissions
- **Error: Extension already exists**: Make sure you're using a unique version number
- **Warning: No repository field**: Add the repository field to package.json

### Resources

- [VS Code Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)
- [VS Code Marketplace](https://marketplace.visualstudio.com/manage)
- [Semver Guidelines](https://semver.org/)
