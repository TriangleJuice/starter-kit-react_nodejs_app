#!/usr/bin/env node
const chalk = require('chalk');
const inquirer = require('inquirer');
const program = require('commander');
const requireDir = require('require-dir');

const generators = requireDir('./generators');
const pjson = require('./package.json');
const questions = require('./config/questions');
const options = require('./config/options');

const { log } = console;
const { mapBranding } = require('./utils/branding');
const fancyLog = require('./utils/fancyLog');
const debug = require('./utils/debug');

global.__basedir = __dirname;
global.__frontenddir = './frontend';
global.__backenddir = './backend';


// Run commander with generator options
options();

function finishInstallation(config) {
  if (config.backend) {
    log(chalk.white.bold(`
✅ ${chalk.green.bold('Done!')} Now run ${chalk.cyan.bold('npm start')} in both your backend and frontend directory.
`));
  } else {
    log(chalk.white.bold(`
✅ ${chalk.green.bold('Done!')} Now run ${chalk.cyan.bold('npm start')} in your frontend directory.
`));
  }
}

async function askQuestions() {
  let config = await inquirer.prompt(questions);
  // Remove this line when activating front-end choices
  config.frontend = 'react';
  const { frontend, backend } = config;
  if (config.backend && generators[backend].getQuestions) {
    const backendConfig = await inquirer.prompt(generators[backend].getQuestions());
    config = Object.assign({}, config, backendConfig);
  }
  if (config.frontend && generators[frontend].getQuestions) {
    const frontendConfig = await inquirer.prompt(generators[frontend].getQuestions());
    config = Object.assign({}, config, frontendConfig);
  }
  return config;
}
/**
 * Go!
 * First check if the starter app was intended to run on its own.
 */
async function run() {
  fancyLog('cyan.bold', `Welcome to the Digipolis starter kit! (v${pjson.version})`, '=');
  if (program.setup) {
    const config = await askQuestions();
    if (program.debug) {
      debug.enable();
    }
    const { frontend, backend } = config;
    // console.log(config);

    if (frontend) await generators[frontend].start(config);
    if (backend) await generators[backend].start(config);

    finishInstallation(config);
  } else {
    program.branding = await mapBranding(program.branding);
    const config = program;
    if (program.debug) {
      debug.enable();
    }
    const { frontend, backend } = config;
    // console.log(config);

    if (frontend) await generators[frontend].start(config);
    if (backend) await generators[backend].start(config);

    finishInstallation(config);
  }
}

run();
