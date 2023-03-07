# Scriptable

## Summary

This repository constains the scripts I've written for [Scriptable](https://scriptable.app), and a development environment for writing Scriptable scripts in TypeScript. It includes:

- [Scripts to install](src/README.md)
- Scriptable type definitions generated from documentation page
- **Run script** hotkey (<kbd>⌘</kbd> + <kbd>SHIFT</kbd> + <kbd>B</kbd>), which will run the current script open in VSCode in Scriptable
- Symlink folder with all your Scriptable files

## Contents

- [Scriptable](#scriptable)
  - [Summary](#summary)
  - [Contents](#contents)
  - [Development Environment](#development-environment)
    - [Getting started](#getting-started)
    - [Initialize your local env](#initialize-your-local-env)
    - [Import your script for git integration](#import-your-script-for-git-integration)
    - [Relative projects](#relative-projects)
    - [ERRORS](#errors)
  - [Thanks](#thanks)

## Development Environment

### Getting started

How to start to develop scriptable apps with VSCode:

1. Download [Scriptable for MacOS](https://scriptable.app/mac-beta/)
2. Enable iCloud sync for Scriptable
3. Download [VSCode](https://code.visualstudio.com/)
4. Clone this repository

  ```sh
  git clone https://github.com/gebeto/scriptables
  ```

5. Run command to initialize your `build` folder link

  ```sh
  ./scriptable.sh init
  ```

6. Done! Open VSCode in the repo(`code .`) and start to build your apps fast and easy!

 > Folder `build` is your scriptable folder link, you can edit files there and it will be updated in scriptable app.

### Initialize your local env

Tou can use BASH script or [VSCode extension](https://marketplace.visualstudio.com/items?itemName=gebeto.vscode-scriptable) for it

```sh
./scriptable.sh init
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

### Relative projects

- [https://github.com/gebeto/scriptable-vscode](https://github.com/gebeto/scriptable-vscode)
    > plugin will replace `scriptable.sh` when it will done(work in progress).
- [https://github.com/schl3ck/ios-scriptable-types](https://github.com/schl3ck/ios-scriptable-types)
    > Scriptable Typescript typings

### ERRORS

If scriptable typing are not loaded for you, need to add `///<reference path="../index.d.ts" />` on top of the your script (like shown below).
Where **path** is a relative path to the `index.d.ts` file.

```diff
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: magic;
+ ///<reference path="../index.d.ts" />

...
```

## Thanks

- [schl3ck](https://github.com/schl3ck) for Scriptable types definition: [ios-scriptable-types](https://github.com/schl3ck/ios-scriptable-types)
