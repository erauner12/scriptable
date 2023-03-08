# Scriptable

## Summary

This repository constains the scripts I've written for [Scriptable](https://scriptable.app), and a development environment for writing Scriptable scripts in TypeScript. It includes:

- My custom Scriptable [scripts and source code](src/README.md)
- Type definitions generated from Scriptable documentation page
- TypeScript compiler and minifier for Scriptable
- Symlink folder with all your Scriptable files
- **Run taks** (<kbd>⌘</kbd> + <kbd>SHIFT</kbd> + <kbd>B</kbd>) with predefined scripts to:
  1. Open the current file in Scriptable
  2. Compile the current TypeScript file to JavaScript
  3. Watch the current TypeScript file and compile it to JavaScript when modified

## Contents

- [Scriptable](#scriptable)
  - [Summary](#summary)
  - [Contents](#contents)
  - [Installing scripts](#installing-scripts)
  - [Repository navigation](#repository-navigation)
  - [Development environment](#development-environment)
    - [Getting started](#getting-started)
    - [Import your script for git integration](#import-your-script-for-git-integration)
  - [Related projects](#related-projects)
  - [Thanks](#thanks)

## Installing scripts

To get started installing scripts in Scriptable go [here](src/README.md).

## Repository navigation

| path        | description                | example                     |
| ----------- | -------------------------- | --------------------------- |
| `./src`     | source code                | `.ts` and `readme.md` files |
| `./dist`    | production code            | `.js` Scriptable files      |
| `./scripts` | custom development scripts | compling `.ts` to `.js`     |

## Development environment

### Getting started

How to start to develop scriptable apps with VSCode:

1. Download [Scriptable for MacOS](https://scriptable.app/mac-beta/)
2. Enable iCloud sync for Scriptable
3. Download [VSCode](https://code.visualstudio.com/)
4. Clone this repository

  ```sh
  git clone https://github.com/gebeto/scriptables
  ```

5. Run command to initialize a `build` folder symlink to the iCloud Scriptables folder

  ```sh
  ./scriptable.sh init
  ```

  > You can edit files here and changes will show in the Scriptable app.

6. Open VSCode in the repo

  ```sh
  code .
  ```

7. Install npm dependencies

  ```sh
  npm install --include=dev
  ```

### Import your script for git integration

 > IMPORTANT: Script name should not contain any **spaces**, because RUN hotkey will now working

```sh
$ ./scriptable.sh import ScriptName
# or
$ ./scriptable.sh import Script-Name
# or
$ ./scriptable.sh import Script_Name
```

## Related projects

- [https://github.com/gebeto/scriptable-vscode](https://github.com/gebeto/scriptable-vscode)
  > plugin will replace `scriptable.sh` when it will done(work in progress).
- [https://github.com/schl3ck/ios-scriptable-types](https://github.com/schl3ck/ios-scriptable-types)
  > Scriptable Typescript typings
- [https://github.com/jsloat/scriptable-utils](https://github.com/jsloat/scriptable-utils)
  > Scriptable utilites to make building interactive elements easier

## Thanks

- [gebeto](https://github.com/gebeto) for the starting environment: [scriptables (scriptable development environment)](https://github.com/gebeto/scriptables)
- [jsloat](https://github.com/jsloat) for TypeScript development enviroment: [scriptable-utils](https://sloat.life/#/scriptable-utils)
- [schl3ck](https://github.com/schl3ck) for Scriptable types definition: [ios-scriptable-types](https://github.com/schl3ck/ios-scriptable-types)
