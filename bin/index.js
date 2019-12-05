#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const shell = require("shelljs");
const chalk = require("chalk");
const inquirer = require("inquirer");
const ora = require("ora");
shell.config.silent = true;

let ORA_SPINNER = {
  interval: 80,
  frames: [
    "   ⠋",
    "   ⠙",
    "   ⠚",
    "   ⠞",
    "   ⠖",
    "   ⠦",
    "   ⠴",
    "   ⠲",
    "   ⠳",
    "   ⠓"
  ]
};

let cwd = path.resolve("./");
let taskHotkeys = /win|linux/i.test(process.platform)
  ? "CONTROL + SHIFT + B"
  : "COMMAND + SHIFT + B";
const config = {
  alwaysAsk: false,
  useLatest: true,
  quiet: false,
  here: false,
  needsInstall: false,
  fileName: "host",
  customName: false
};
const apps = {
  Illustrator: {
    name: "Illustrator",
    aliases: ["ilst", "ai", "illustrator"],
    versions: ["2015.3", "2017", "2018", "2019", "2020"]
  },
  AfterEffects: {
    name: "AfterEffects",
    aliases: ["aeft", "ae", "after effects", "afterfx"],
    versions: ["2018"]
  },
  Photoshop: {
    name: "Photoshop",
    aliases: ["phxs", "ps", "photoshop"],
    versions: ["2015.3"]
  },
  InDesign: {
    name: "InDesign",
    aliases: ["idsn", "id", "indesign", "in design"],
    versions: ["2015.3", "2018", "2019"]
  },
  Premiere: {
    name: "Premiere",
    aliases: ["ppro", "pp", "premiere", "premiere pro"],
    versions: ["2018", "2019"]
  },
  Audition: {
    name: "Audition",
    aliases: ["audt", "au", "audition"],
    versions: ["2015.2", "2017", "2018"]
  }
};

let tsconfig = {
  compileOnSave: true,
  compilerOptions: {
    outFile: "./host.jsx",
    allowJs: true,
    noLib: true,
    types: []
  },
  files: ["host.ts"],
  exclude: ["node_modules"]
};

async function init() {
  let app,
    args = process.argv;
  checkForConfigArgs(args);
  if (args.length) {
    let fileCheck = args.filter((arg, i) => {
      return i > 1 && /\w*\.(t|j)s(x?)$/.test(arg);
    });
    if (fileCheck.length)
      config.fileName = fileCheck[0].replace(/\.(t|j)s(x?)/, "");
  }
  if (args.includes("help")) showHelp();
  else {
    let targPath = !config.here ? await findNearestParentPackage(cwd) : cwd;
    config.needsInstall = await checkPackageForInstall(targPath);
    if (args.length > 2) app = await findApp(args);
    app = app ? app : await inquireAboutApp();

    generateTSConfig(app, targPath);
    writeDefaultFiles();
    if (config.needsInstall) installTypes(targPath, app);
    else showEndMessage(targPath, app);
  }
}

async function inquireAboutApp() {
  console.log("");
  console.log(`Welcome! Let's get started.`);
  console.log("");
  let answers = await inquirer.prompt([
    {
      type: "list",
      name: "app",
      message: `Which app are you scripting for?`,
      choices: Object.keys(apps).map(item => {
        return {
          name: item !== "AfterEffects" ? item : "After Effects",
          value: item
        };
      })
    },
    {
      type: "input",
      name: "name",
      message: `What should the name of the script file be?`
    }
  ]);
  config.fileName = answers.name.replace(" ", "-").replace(/\.(j|t)s(x?)/, "");
  return apps[answers.app];
}

async function findApp(args) {
  let result,
    valids = args.filter(arg => {
      return /^[a-z\s]*$/i.test(arg);
    });
  Object.keys(apps).forEach(app => {
    let rx = new RegExp(apps[app].aliases.join("|"), "i");
    valids.forEach(valid => {
      if (rx.test(valid)) result = apps[app];
    });
  });
  return result ? result : await inquireAboutApp();
}

function showHelp() {
  console.log("");
  console.log("Welcome!");
  console.log("");
  console.log(
    `This package is best used when installed globally, but relies on a local package.json to install type definitions. If you haven't already, you should run ${chalk.yellow(
      "npm init -y"
    )} somewhere in your project.`
  );
  console.log("");
  console.log(
    `You can then run ${chalk.yellow(
      "scriptopia"
    )} at any time to get a prompt about the app and name of your resulting file.`
  );
  console.log("");
  console.log(
    `If you want to skip the prompts, you can optionally add the app name or file name after the command, like so:`
  );
  console.log("");
  console.log(`  - ${chalk.yellow("scriptopia ai test.jsx")}`);
  console.log(`  - ${chalk.yellow("scriptopia ilst myscript.ts")}`);
  console.log(`  - ${chalk.yellow("scriptopia illustrator somescript.js")}`);
  console.log("");
  console.log(
    `You can see more details at ${chalk.blue(
      `https://github.com/Inventsable/scriptopia`
    )}`
  );
  console.log("");
}

function showEndMessage(thispath, app) {
  let trail = differenceFromRoot(thispath);
  let root = thispath.match(/[^\\|\/]*$/)[0];
  let relpath = `${root}/${trail.travelDown}`;
  relpath = relpath.replace(/\\/gm, "/");
  let lengthcheck = replace.split(/\\|\//);
  if (lengthcheck.length == 2) relpath = relpath.match(/[^\\|\/]*$/)[0];
  console.log("");
  console.log(`✔  We're all done!`);

  console.log("");
  console.log(
    `Now hit ${chalk.yellow(`${taskHotkeys}`)} and select ${chalk.bgBlue.black(
      ` tsc: watch - ${relpath}/tsconfig.json `
    )}`
  );
  console.log("");
  console.log(
    `You should now use ${chalk.green(
      `${config.fileName}.ts`
    )} to write code, but ${chalk.green(`${config.fileName}.jsx`)} to run in ${
      app.name
    }.`
  );
  console.log("");
}

function writeDefaultFiles() {
  fs.writeFileSync(
    `${cwd}/${config.fileName.replace(/\..*/, "")}.ts`,
    `// Welcome to the world of Typescript!
// Be sure to run 'tsc: watch - [path to tsconfig]', then try writing 'app.' below:`
  );
}

async function readDir(thispath) {
  return new Promise((resolve, reject) => {
    fs.readdir(path.resolve(thispath), { encoding: "utf-8" }, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
}

function generateTSConfig(app, thispath) {
  let version = config.useLatest
    ? app.versions[app.versions.length - 1]
    : app.versions[0];
  tsconfig.compilerOptions.outFile = `./${config.fileName}.jsx`;
  tsconfig.compilerOptions.types = [`types-for-adobe/${app.name}/${version}`];
  tsconfig.files = [`${config.fileName}.ts`];
  fs.writeFileSync(
    path.resolve(`${cwd}/tsconfig.json`),
    JSON.stringify(tsconfig)
  );
}

// Redundant, not using enough config args to justify this.
function checkForConfigArgs(args) {
  if (!args.length) {
    let valids = args.filter(arg => {
      return /^\-[a-z]*$/i.test(arg);
    });
    if (!valids.length) return null;
    let possibles = {
      alwaysAsk: ["ask", "a"],
      useLatest: ["latest", "l"],
      quiet: ["quiet", "q"],
      here: ["here", "h"]
    };
    valids.forEach(valid => {
      Object.keys(possibles).forEach(key => {
        possibles[key].forEach(term => {
          config[key] = !config[key]
            ? new RegExp(`^\-${term}$`, "i").test(valid)
            : true;
        });
      });
    });
  }
}

// Redundant, not needed
async function findNearestParentPackage(thispath) {
  let children = await readDir(thispath);
  if (!children.length || !children.includes("package.json"))
    return await findNearestParentPackage(thispath.replace(/\/|\\\w*$/, ""));
  else if (children.includes("package.json")) return thispath;
}

// Redundant since npm install automatically handles parenting chains
async function installTypes(thispath, app) {
  // let paths = differenceFromRoot(thispath);
  // shell.cd(paths.travelUp);
  let spinner = ora({
    text: `Installing types to ${
      thispath.match(/[^\\|\/]*$/)[0]
    }... (This may take a while)`,
    spinner: ORA_SPINNER
  }).start();
  shell.exec("npm install ten-A/types-for-adobe --save-dev", () => {
    console.log("");
    spinner.stopAndPersist({
      symbol: "",
      text: `${chalk.black.bgBlue(` ✔ SUCCESSFULLY INSTALLED `)}`
    });
    showEndMessage(thispath, app);
  });
}

async function checkPackageForInstall(thispath) {
  let files = await readDir(thispath);
  let found = false;
  if (files.length && files.includes("package.json")) {
    let manifest = JSON.parse(
      fs.readFileSync(path.resolve(`${thispath}/package.json`), {
        encoding: "utf-8"
      })
    );
    let keys = [];
    if (manifest.dependencies)
      keys = [].concat(keys, Object.keys(manifest.dependencies));
    if (manifest.devDependencies)
      keys = [].concat(keys, Object.keys(manifest.devDependencies));
    if (!keys.length) return true;
    keys.forEach(dep => {
      if (dep == "types-for-adobe") found = true;
    });
  }
  return !found;
}

// Redundant, npm install automatically handles parent chaining
function differenceFromRoot(thispath) {
  let remainder = cwd.replace(thispath, "");
  if (!remainder.length) return { travelUp: "", travelDown: "" };
  else {
    remainder = remainder.replace(/(^\\|\/)|(\\|\/)$/, "");
    let depths = remainder.split(/\\|\//);
    return {
      travelUp: depths
        .map(d => {
          return "..";
        })
        .join("/"),
      travelDown: remainder
    };
  }
}

init();
