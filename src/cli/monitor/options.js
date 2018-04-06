import minimist from 'minimist';
import optionDefault from '../utils/option-default';
import _ from 'lodash';
import cliclopts from 'cliclopts';
import {
  CONFIG_FILE_VAR,
  WORKING_DIRECTORY_VAR,
  FORCE_COLOR_VAR,
  DEBUG_VAR,
  RESET_VAR,
  DEFAULT_CONFIG_FILE,
  DEFAULT_WORKING_DIR,
  DEFAULT_DEBUG_OPTION,
  DEFAULT_COLOR_OPTION,
  DEFAULT_RESET_OPTION,
  MULTIPLE_WORKING_DIRECTORIES_ERROR,
  MULTIPLE_CONFIG_FILES_ERROR,
  NO_COMMAND_ERROR,
  MONITOR_USAGE_TEXT,
} from '../../constants';

// istanbul ignore next
const toBool = (value) => value === 'true';

const defaultDebug = optionDefault(
  DEBUG_VAR,
  DEFAULT_DEBUG_OPTION,
  toBool,
);

const defaultReset = optionDefault(
  RESET_VAR,
  DEFAULT_RESET_OPTION,
  toBool,
);

const defaultColor = optionDefault(
  FORCE_COLOR_VAR,
  DEFAULT_COLOR_OPTION,
  toBool,
);

const defaultConfigFile = optionDefault(
  CONFIG_FILE_VAR,
  DEFAULT_CONFIG_FILE,
);

const defaultWorkingDirectory = optionDefault(
  WORKING_DIRECTORY_VAR,
  DEFAULT_WORKING_DIR,
);

const cliOpts = cliclopts([{
  name: 'config-file',
  abbr: 'c',
  default: defaultConfigFile,
  help: 'The config file to load options from if present',
}, {
  name: 'working-dir',
  abbr: 'w',
  default: defaultWorkingDirectory,
  help: 'The directory in which to write logs, etc',
}, {
  name: 'reset',
  abbr: 'r',
  boolean: true,
  default: defaultReset,
  help: 'Reset the working directory on start',
}, {
  name: 'force-color',
  abbr: 'f',
  boolean: true,
  default: defaultColor,
  help: 'Set the FORCE_COLOR environment variable for watchers and jobs',
}, {
  name: 'debug',
  abbr: 'd',
  boolean: true,
  default: defaultDebug,
  help: 'Enable additional UI debug in the ui.log',
}, {
  name: 'help',
  abbr: 'h',
  alias: ['?'],
  boolean: true,
  help: 'Show help',
}, {
  name: 'version',
  abbr: 'v',
  boolean: true,
  help: 'Show version number',
}]);

export function help() {
  return MONITOR_USAGE_TEXT + cliOpts.usage() + '\n';
}

export function parse(argv) {
  const parsed = minimist(argv, Object.assign(cliOpts.options(), {
    stopEarly: true,
  }));
  const command = parsed._[0];
  if (parsed.version) {
    return {
      version: true,
    };
  }
  if (parsed.help) {
    return {
      help: true,
    };
  }
  if (parsed['config-file'] instanceof Array) {
    return {
      error: MULTIPLE_CONFIG_FILES_ERROR,
    };
  }
  if (parsed['working-dir'] instanceof Array) {
    return {
      error: MULTIPLE_WORKING_DIRECTORIES_ERROR,
    };
  }
  if (_.isUndefined(command)) {
    return {
      error: NO_COMMAND_ERROR,
    };
  }
  const args = parsed._.slice(1);
  const debug = parsed['debug'];
  const color = parsed['force-color'];
  const reset = parsed['reset'];
  const configFile = parsed['config-file'];
  const workingDir = parsed['working-dir'];
  return {
    command,
    args,
    debug,
    color,
    reset,
    configFile,
    workingDir,
    help: false,
    version: false,
  };
};
