#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
let helpme = false;
let cwd = path.dirname(fs.realpathSync(__filename));
let taskHotkeys = /win|linux/i.test(process.platform)
  ? "CONTROL + SHIFT + B"
  : "COMMAND + SHIFT + B";
const config = {
  alwaysAsk: false,
  useLatest: true,
  quiet: false
};
const apps = {
  AEFT: {
    aliases: ["aeft", "ae", "after effects", "afterfx"],
    versions: ["2018"]
  },
  ILST: {
    aliases: ["ilst", "ai", "illustrator"],
    versions: ["2015.3", "2017", "2018", "2019", "2020"]
  },
  PHXS: {
    aliases: ["phxs", "ps", "photoshop"],
    versions: ["2015.3"]
  },
  AUDT: {
    aliases: ["audt", "au", "audition"],
    versions: ["2015.2", "2017", "2018"]
  },
  PPRO: {
    aliases: ["ppro", "pp", "premiere", "premiere pro"],
    versions: ["2018", "2019"]
  },
  IDSN: {
    aliases: ["idsn", "id", "indesign", "in design"],
    versions: ["2015.3", "2018", "2019"]
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
  const args = process.argv;
  console.log(cwd);
  checkForConfigArgs(args);
  if (helpme) return showHelp();
  let app;
  if (args.length > 2) app = await findApp(args);
  app = app ? app : await inquireAboutApp();
  if (!config.quiet) console.log(app);
}

async function inquireAboutApp() {
  //
  console.log(process.argv);
  return true;
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

function checkForConfigArgs(args) {
  let valids = args.filter(arg => {
    return /^\-[a-z]*$/i.test(arg);
  });
  if (!valids.length) return null;
  let possibles = {
    alwaysAsk: ["ask", "a"],
    useLatest: ["latest", "l"],
    quiet: ["quiet", "q"]
  };
  valids.forEach(valid => {
    Object.keys(possibles).forEach(key => {
      possibles[key].forEach(term => {
        if (/\-h|\-help/) helpme = true;
        config[key] = new RegExp(`^\-${term}$`, "i").test(valid);
      });
    });
  });
}
function showHelp() {
  console.log("WELCOME!");
}

init();
