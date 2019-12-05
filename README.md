# scriptopia

Generate Typescript support for any compatible Adobe app with a single terminal command:

![screen capture]()

## Installation

```bash
# Recommended global so you can use this any time, in any folder
npm install -g scriptopia
```

## Usage

Scriptopia will download reliable typescript definitions to your project (but skip if already present), generate a `tsconfig.json` and `.ts` file in your current working directory, then instruct you on the hotkey to run the `tsc: watch` task to finish your setup.

Using the command with no arguments will result in a CLI prompt for which application to script for, and what the name of the file should be:

```bash
# This assumes a package.json is present somewhere in your project. If so, you can use it within any child no matter the depth, but if not, you'll need to create one beforehand:
npm init -y

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

---

## Help

Feel free to file an issue, but if you have `help` any where in your arguments, like so:

```bash
scriptopia help
```

You'll see a message similar to the above outlining it's usage.
