#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function init() {
  const args = process.env.args;
  console.log(args);
}

init();
