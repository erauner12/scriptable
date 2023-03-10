# Scriptable

## Summary

This repository constains the scripts I've written for Scriptable, and development environment for writing Scriptable scripts in TypeScript. It includes:

- My custom Scriptable [scripts and source code](src/README.md)
- Type definitions generated from Scriptable documentation page
- TypeScript compiler and minifier for Scriptable
- Symlink folder with all your Scriptable files
- Run taks with predefined scripts to:
  1. Open the current file in Scriptable
  2. Compile the current TypeScript file to JavaScript
  3. Watch the current TypeScript file and compile it to JavaScript when modified

## Contents

- [Scriptable](#scriptable)
  - [Summary](#summary)
  - [Contents](#contents)
  - [About](#about)
  - [Installing scripts](#installing-scripts)
  - [Repository navigation](#repository-navigation)
  - [Development environment](#development-environment)
    - [Getting started](#getting-started)
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

## About

[Scriptable](https://scriptable.app) is an app for iOS and MacOS, that allows you to create widgets and run automations created in JavaScript.

Most of the scripts that can be found in this repo were born out of limitations I've encountered with applications or/and the iOS platform itself; the aim for these scripts is to solve these limitations with elegant solutions.

## Installing scripts

To get started installing scripts in Scriptable go [here](src/README.md).

## Repository navigation

| path        | description                               | comments                                              |
| ----------- | ----------------------------------------- | ----------------------------------------------------- |
| `./src`     | source code                               | `.ts` and `readme.md` files                           |
| `./dist`    | production code                           | `.js` Scriptable files                                |
| `./scripts` | development scripts                       | additional scripts for compling `.ts` to `.js`        |
| `./build`   | symbolic link to iCloud Scriptable folder | initialised with npm run init, excluded from git comm |

## Development environment

### Getting started

How to start developing scriptable apps with VSCode:

1. Download [Scriptable for MacOS](https://scriptable.app/mac-beta/)
2. Enable iCloud sync for Scriptable
3. Download [VSCode](https://code.visualstudio.com/)
4. Clone this repository

  ```sh
  git clone https://github.com/Elliott-Liu/scriptable
  ```

5. Open VSCode in the repo

  ```sh
  code .
  ```

6. Run command to initialize a `build` folder symlink to the iCloud Scriptables folder

  ```node
  npm run init
  ```

7. Install npm dependencies

  ```sh
  npm install --include=dev
  ```

### Compiling from TypeScript to JavaScript

1. Open a TypeScript file in VSCode.
2. Run a [task](#vscode-tasks) - I'd reccomend: `Build, link, and open current script` (this will build the file to the `dist` folder, syslink it to the `build` folder and open it in Scriptables)

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

The tasks are relatively self-explanitory and simply pass in the required arguments for the `npm` commands:

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
  > Scriptable utilites to make building interactive elements easier
- [https://github.com/gebeto/scriptable-vscode](https://github.com/gebeto/scriptable-vscode)
  > VSCode plugin that should replace `scriptable.sh` when it's finished (work in progress).

## Thanks

- [gebeto](https://github.com/gebeto) for the starting environment: [scriptables (scriptable development environment)](https://github.com/gebeto/scriptables)
- [jsloat](https://github.com/jsloat) for TypeScript development enviroment: [scriptable-utils](https://sloat.life/#/scriptable-utils)
- [schl3ck](https://github.com/schl3ck) for Scriptable types definition: [ios-scriptable-types](https://github.com/schl3ck/ios-scriptable-types)
