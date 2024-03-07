# Scriptable

Welcome to my [Scriptable](https://scriptable.app) repository!

You'll discover a curated collection of scripts and widgets designed to enhance your iOS and MacOS experience. Whether you're looking to streamline your daily tasks, fetch specific data, or add a personal touch to your device, this repository serves as a treasure trove of Scriptable solutions.

Get started by downloading the Scriptable app, follow the simple setup instructions, and explore the array of scripts available to transform your interaction with your device. Whether you're a seasoned programmer or a curious newbie, this repository offers the tools and guidance to unlock the full potential of Scriptable.

## Getting started

1. Download Scriptable for iOS / MacOS from the [App Store](https://apps.apple.com/us/app/scriptable/id1405459188).
2. Install [ScriptDude](https://scriptdu.de/#installation) using the instructions on their website (*this is how we easily install and update our scripts*).
3. Install a Script from the list below!

## Scripts

| Script                                        | Description                                              |                                                                                                                                                             Install                                                                                                                                                              |
| --------------------------------------------- | :------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| [Redirect Me](./src/Redirect%20Me/README.md) | Redirect a URL from the Share Sheet to another location. | [![Download with ScriptDude](https://scriptdu.de/download.svg)](https://scriptdu.de/?name=Redirect%20Me&source=https%3A%2F%2Fraw.githubusercontent.com%2FElliott-Liu%2Fscriptable%2Fmain%2Fdist%2FRedirect%2520Me.js&docs=https%3A%2F%2Fgithub.com%2FElliott-Liu%2Fscriptable%2Fblob%2Fmain%2Fsrc%2FRedirect%2520Me%2FREADME.md) |
| [Prayer Time](./src/Prayer%20Time/README.md) | See the upcoming Islamic prayer times for the day.       | [![Download with ScriptDude](https://scriptdu.de/download.svg)](https://scriptdu.de/?name=Prayer%20Time&source=https%3A%2F%2Fraw.githubusercontent.com%2Felliott-liu%2Fscriptable%2Fmain%2Fdist%2FPrayer%2520Time.js&docs=https%3A%2F%2Fgithub.com%2FElliott-Liu%2Fscriptable%2Fblob%2Fmain%2Fsrc%2FPrayer%2520Time%2FREADME.md) |
| [Days Until](./src/Days%20Until/README.md)   | Display a countdown to a specific date.                  |  [![Download with ScriptDude](https://scriptdu.de/download.svg)](https://scriptdu.de/?name=Days%20Until&source=https%3A%2F%2Fraw.githubusercontent.com%2Felliott-liu%2Fscriptable%2Fmain%2Fdist%2FDays%2520Until.js&docs=https%3A%2F%2Fgithub.com%2FElliott-Liu%2Fscriptable%2Fblob%2Fmain%2Fsrc%2FDays%2520Until%2FREADME.md)   |
| [Cantonese Romanisation](./src/Cantonese%20Romanisation/README.md)   | Transform Chinese into Cantonese romanisation.                  |  [![Download with ScriptDude](https://scriptdu.de/download.svg)](https://scriptdu.de?name=Cantonese%20Romanisation&source=https%3A%2F%2Fraw.githubusercontent.com%2Felliott-liu%2Fscriptable%2Fmain%2Fdist%2FCantonese%20Romanisation.js&docs=https%3A%2F%2Fgithub.com%2Felliott-liu%2Fscriptable%2Fblob%2Fmain%2Fsrc%2FCantonese%20Romanisation%2FREADME.md)  |

## Contents

- [Scriptable](#scriptable)
  - [Getting started](#getting-started)
  - [Scripts](#scripts)
  - [Developing](#developing)
    - [Setting up environment](#setting-up-environment)
    - [Repository navigation](#repository-navigation)
    - [Compiling from TypeScript to JavaScript](#compiling-from-typescript-to-javascript)
    - [Export script to Scriptable (iCloud directory)](#export-script-to-scriptable-icloud-directory)
    - [npm](#npm)
      - [Init](#init)
      - [Export](#export)
      - [Export module](#export-module)
      - [Build](#build)
      - [Build and watch](#build-and-watch)
      - [Open](#open)
    - [VSCode tasks](#vscode-tasks)
    - [Notes](#notes)
  - [Related projects](#related-projects)
  - [Thanks](#thanks)

## Developing

### Setting up environment

How to start developing scriptable apps with VSCode:

1. Download [Scriptable for MacOS](https://scriptable.app/mac-beta/)
2. Enable iCloud sync for Scriptable
3. Download [VSCode](https://code.visualstudio.com/)
4. Clone this repository: `git clone https://github.com/Elliott-Liu/scriptable`
5. Open VSCode in the repo: `code .`
6. Run command to initialize a `build` folder symlink to the iCloud Scriptable folder: `npm run init`
7. Install npm dependencies `npm install --include=dev`

### Repository navigation

| path        | description                               | comments                                              |
| ----------- | ----------------------------------------- | ----------------------------------------------------- |
| `./src`     | source code                               | `.ts` and `readme.md` files                           |
| `./dist`    | production code                           | `.js` Scriptable files                                |
| `./scripts` | development scripts                       | additional scripts for compiling `.ts` to `.js`        |
| `./build`   | symbolic link to iCloud Scriptable folder | initialised with npm run init, excluded from git comm |

### Compiling from TypeScript to JavaScript

1. Open a TypeScript file in VSCode.
2. Run a [task](#vscode-tasks) - I'd recommend: `Build, link, and open current script` (this will build the file to the `dist` folder, symlink it to the `build` folder and open it in Scriptable)

### Export script to Scriptable (iCloud directory)

For scripts use:

```node
npm run export
```

For modules use:

```node
npm run export_module
```

### npm

The following commands are for the symbolic linking of files:

#### Init

```node
npm run init
```

#### Export

```node
npm run export
```

#### Export module

```node
npm run export_module
```

These commands are for compiling from TypeScript to JavaScript and running the script in Scriptable. Each should be followed by an argument, either:

- the name of the script (surrounded in quotation marks *if* it contains spaces): e.g. `"Hello World"` or `Hello_World`
- the relative path of the script with file extension (surrounded in quotation marks *if* it contains spaces): e.g. `"./src/Hello World/Hello World.ts"` or `./src/Hello_World/Hello_World.ts`

#### Build

```node
npm run build
```

#### Build and watch

```node
npm run build-watch
```

#### Open

```node
npm run open
```

### VSCode tasks

These are defined in the `.vscode/tasks.json`, they allow you to run a command directly from the current script you're working on.

The default shortcut to run tasks is <kbd>⌘</kbd> + <kbd>SHIFT</kbd> + <kbd>B</kbd>.

The tasks are relatively self-explanatory and simply pass in the required arguments for the `npm` commands:

- `Open current script in Scriptable`
- `Build current script`
- `Build and watch current script`
- `Build, export, and open current script`

### Notes

When developing in this environment, there are a few things to keep in mind:

- When compiling from TypeScript using the `npm run build` or `npm run build-watch`, the resulting JavaScript file will be placed in the `dist` folder with the same name (with `.js` as the file extension).
  > Ensure that you actually intend to overwrite any existing files in here before running, or/and ensure that files are already backed up to `git` before running this command.

## Related projects

- [https://github.com/schl3ck/ios-scriptable-types](https://github.com/schl3ck/ios-scriptable-types)
  > Scriptable Typescript type definitions
- [https://github.com/jsloat/scriptable-utils](https://github.com/jsloat/scriptable-utils)
  > Scriptable utilities to make building interactive elements easier
- [https://github.com/gebeto/scriptable-vscode](https://github.com/gebeto/scriptable-vscode)
  > VSCode plugin that should replace `scriptable.sh` when it's finished (work in progress).

## Thanks

- [gebeto](https://github.com/gebeto) for the starting environment: [scriptable (scriptable development environment)](https://github.com/gebeto/scriptables)
- [jsloat](https://github.com/jsloat) for TypeScript development environment: [scriptable-utils](https://sloat.life/#/scriptable-utils)
- [schl3ck](https://github.com/schl3ck) for Scriptable types definition: [ios-scriptable-types](https://github.com/schl3ck/ios-scriptable-types)
