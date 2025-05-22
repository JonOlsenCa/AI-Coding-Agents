const fs = require('fs');
const path = require('path');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// List of required screenshots
const screenshots = [
  'agent-panel.png',
  'sidebar-view.png',
  'welcome-panel.png',
  'prompt-editor.png',
  'history-view.png'
];

// Create a simple placeholder image for each screenshot
screenshots.forEach(screenshot => {
  const filePath = path.join(screenshotsDir, screenshot);
  
  // Check if the file already exists
  if (!fs.existsSync(filePath)) {
    // Create a simple 1x1 transparent PNG
    const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    fs.writeFileSync(filePath, transparentPixel);
    console.log(`Created placeholder for ${screenshot}`);
  } else {
    console.log(`${screenshot} already exists, skipping`);
  }
});

console.log('All placeholder screenshots created successfully!');
