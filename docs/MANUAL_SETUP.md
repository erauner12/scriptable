# Manual Scriptable Development Guide

This guide explains how to develop Scriptable scripts manually without using the build system.

## Prerequisites

1. Install [Scriptable](https://scriptable.app/) on your iOS/iPadOS device
2. (Optional) Install [Scriptable for MacOS](https://scriptable.app/mac-beta/) if you're developing on a Mac

## Basic Script Development

### Method 1: Direct in Scriptable App

1. Open Scriptable app
2. Tap the + button to create a new script
3. Write your code directly in the editor
4. Tap the play button to test

### Method 2: Using iCloud Sync (Recommended)

1. Enable iCloud Drive on your device
2. Navigate to:
   - iOS/iPadOS: Files app → iCloud Drive → Scriptable
   - macOS: `~/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents/`
3. Create `.js` files directly in this folder
4. They will automatically sync to your devices

## TypeScript Development

If you want to use TypeScript, you'll need to set up a manual compilation process:

1. Create a project directory:
```bash
mkdir my-scriptable-project
cd my-scriptable-project
```

2. Initialize a new npm project:
```bash
npm init -y
```

3. Install TypeScript:
```bash
npm install --save-dev typescript @types/node
```

4. Create a basic tsconfig.json:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "module": "ESNext",
    "lib": ["ES6"],
    "moduleResolution": "node",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

5. Add build script to package.json:
```json
{
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  }
}
```

## Project Structure

```
my-scriptable-project/
├── src/
│   └── scripts/
│       ├── MyWidget.ts
│       └── AnotherScript.ts
├── dist/
│   └── scripts/
│       ├── MyWidget.js
│       └── AnotherScript.js
├── tsconfig.json
└── package.json
```

## Script Template

Here's a basic TypeScript template for a Scriptable widget:

```typescript
// Scriptable widget configuration
// These must be at the very top of the file
// @ts-ignore
// icon-color: deep-purple; icon-glyph: calendar-alt;

interface WidgetConfig {
  widgetFamily?: "small" | "medium" | "large";
}

// @ts-ignore
const config: WidgetConfig = {};

async function createWidget() {
  const widget = new ListWidget();
  
  // Add your widget content here
  const text = widget.addText("Hello, World!");
  text.centerAlignText();
  
  return widget;
}

async function main() {
  const widget = await createWidget();
  
  if (config.widgetFamily) {
    // Widget is being previewed or running on home screen
    Script.setWidget(widget);
  } else {
    // Script is running in app
    widget.presentMedium();
  }
}

await main();
```

## Manual Deployment

1. Compile your TypeScript:
```bash
npm run build
```

2. Copy the compiled JS file to your Scriptable folder:
   - iOS/iPadOS: Use the Files app to copy
   - macOS: Copy to `~/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents/`
   ```bash
   cp dist/scripts/MyWidget.js "~/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents/"
   ```

## Development Tips

1. Use Scriptable's built-in types:
```typescript
interface WidgetConfig {
  runsInWidget?: boolean;
  widgetFamily?: "small" | "medium" | "large";
}

interface Args {
  widgetParameter?: string;
  queryParameters?: { [key: string]: string };
  fileURLs?: string[];
  plainTexts?: string[];
  urls?: string[];
  images?: Image[];
}

// Access these as global variables
declare const config: WidgetConfig;
declare const args: Args;
```

2. Testing Widget Sizes:
```typescript
if (config.widgetFamily === "small") {
  // Small widget layout
} else if (config.widgetFamily === "medium") {
  // Medium widget layout
} else if (config.widgetFamily === "large") {
  // Large widget layout
} else {
  // Running in app
}
```

3. Debugging:
- Use `console.log()` for debugging
- Test in the Scriptable app first
- Use `Safari Web Inspector` for advanced debugging (requires iOS device connected to Mac)

## Common Scriptable APIs

```typescript
// File Management
const fm = FileManager.iCloud();
const path = fm.documentsDirectory();
fm.writeString(path + "/test.txt", "Hello");
const content = fm.readString(path + "/test.txt");

// Networking
const req = new Request("https://api.example.com/data");
const json = await req.loadJSON();

// UI Elements
const alert = new Alert();
alert.title = "Title";
alert.message = "Message";
alert.addAction("OK");
await alert.present();

// Widgets
const widget = new ListWidget();
widget.backgroundColor = Color.black();
widget.addText("Hello");
```

## Best Practices

1. Always handle errors:
```typescript
try {
  // Your code here
} catch (error) {
  console.error(`Error: ${error}`);
  const widget = new ListWidget();
  widget.addText("Error: " + String(error));
  return widget;
}
```

2. Use TypeScript features:
```typescript
interface WidgetData {
  title: string;
  value: number;
}

function formatData(data: WidgetData): string {
  return `${data.title}: ${data.value}`;
}
```

3. Cache network requests:
```typescript
async function fetchWithCache(url: string, expiry: number = 3600): Promise<any> {
  const fm = FileManager.iCloud();
  const cachePath = fm.joinPath(fm.documentsDirectory(), "cache.json");
  
  // Check cache
  if (fm.fileExists(cachePath)) {
    const cacheString = fm.readString(cachePath);
    const cache = JSON.parse(cacheString);
    if (cache.timestamp > Date.now() - expiry * 1000) {
      return cache.data;
    }
  }
  
  // Fetch new data
  const req = new Request(url);
  const data = await req.loadJSON();
  
  // Save to cache
  fm.writeString(cachePath, JSON.stringify({
    timestamp: Date.now(),
    data
  }));
  
  return data;
}
```

## Resources

- [Scriptable Documentation](https://docs.scriptable.app/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [iOS Widget Size Guide](https://developer.apple.com/design/human-interface-guidelines/widgets#widgets-on-ios)
