# scriptopia

Generate Typescript support for any compatible Adobe app with a single terminal command:

![screen capture]()

## Installation

```bash
# Recommended global so you can use this any time, in any folder
npm install -g scriptopia
```

## Usage

Scriptopia will download reliable typescript definitions to your project (but skip if already present), then generate a `tsconfig.json` and `.ts` file in your current working directory.

Using the command with no arguments will result in a CLI prompt for which application to script for, and what the name of the file should be:

```bash
scriptopia
```

You can skip this prompt by adding them as arguments instead. Any of the below are valid:

```bash
scriptopia ai test.js
scriptopia ilst file.ts
scriptopia illustrator myScript.jsx
```

## App aliases (case insensitive):

- Illustrator - `ai`, `ilst`, or `illustrator`
- After Effects - `ae`, `aeft`, `aftereffects`, or `afterfx`
- Photoshop - `ps`, `phxs`, or `photoshop`
- InDesign - `id`, `idsn`, or `indesign`
- Premeire Pro - `pp`, `ppro`, `premiere`, or `premierepro`
- Audition - `au`, `audt`, or `audition`
