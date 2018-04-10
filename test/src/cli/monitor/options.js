import {
  help,
  parse,
} from '../../../../src/cli/monitor/options';
import _ from 'lodash';
import {
  DEFAULT_CONFIG_FILE,
  DEFAULT_WORKING_DIR,
  DEFAULT_DEBUG_OPTION,
  DEFAULT_COLOR_OPTION,
  DEFAULT_RESET_OPTION,
  DEFAULT_MONITOR_NAME,
  NO_COMMAND_ERROR,
  MULTIPLE_NAMES_ERROR,
  MULTIPLE_WORKING_DIRECTORIES_ERROR,
  MULTIPLE_CONFIG_FILES_ERROR,
  MONITOR_USAGE_TEXT,
} from '../../../../src/constants';

const name = 'name';
const workingDir = 'working dir';
const configFile = 'config file';
const command = 'command';
const arg1 = '--arg1';
const arg2 = '--arg2';

const noCommand = [
];

const fullVersionOption = [
  '--version',
];

const shortVersionOption = [
  '-v',
];

const fullHelpOption = [
  '--help',
];

const shortHelpOption = [
  '-h',
];

const aliasHelpOption = [
  '-?',
];

const noOptions = [
  command,
  arg1,
  arg2,
];

const shortOptions = [
  '-d',
  '-r',
  '-f',
  '-n',
  name,
  '-c',
  configFile,
  '-w',
  workingDir,
  command,
  arg1,
  arg2,
];

const fullOptions = [
  '--debug',
  '--reset',
  '--force-color',
  '--name',
  name,
  '--config-file',
  configFile,
  '--working-dir',
  workingDir,
  command,
  arg1,
  arg2,
];

const negatedOptions = [
  '--no-debug',
  '--no-reset',
  '--no-force-color',
  '--name',
  name,
  '--config-file',
  configFile,
  '--working-dir',
  workingDir,
  command,
  arg1,
  arg2,
];

const names = [
  '--name',
  name,
  '--name',
  name,
  command,
  arg1,
  arg2,
];

const workingDirectories = [
  '--working-dir',
  workingDir,
  '--working-dir',
  workingDir,
  command,
  arg1,
  arg2,
];

const configFiles = [
  '--config-file',
  configFile,
  '--config-file',
  configFile,
  command,
  arg1,
  arg2,
];

let options;

describe('cli', () => {
  describe('monitor', () => {
    describe('options', () => {
      describe('#help', () => {
        it('should return the help message', () => {
          help().should.match(
            new RegExp('^' + _.escapeRegExp(MONITOR_USAGE_TEXT))
          );
        });
      });

      describe('#parse', () => {
        _.forEach({
          'with no command': {
            argv: noCommand,
            error: NO_COMMAND_ERROR,
          },
          'with multiple names specified': {
            argv: names,
            error: MULTIPLE_NAMES_ERROR,
          },
          'with multiple working directories specified': {
            argv: workingDirectories,
            error: MULTIPLE_WORKING_DIRECTORIES_ERROR,
          },
          'with multiple config files specified': {
            argv: configFiles,
            error: MULTIPLE_CONFIG_FILES_ERROR,
          },
        }, (value, key) => {
          describe(key, () => {
            before(() => {
              options = parse(value.argv);
            });

            it('should set the error', () => {
              options.error.should.eql(value.error);
            });
          });
        });

        _.forEach({
          'with the full version option': fullVersionOption,
          'with the short version option': shortVersionOption,
        }, (value, key) => {
          describe(key, () => {
            before(() => {
              options = parse(value);
            });

            it('should set the version flag to true', () => {
              options.version.should.eql(true);
            });

            it('should not set the error', () => {
              expect(options.error).to.not.be.ok;
            });
          });
        });

        _.forEach({
          'with the full help option': fullHelpOption,
          'with the short help option': shortHelpOption,
          'with the alias help option': aliasHelpOption,
        }, (value, key) => {
          describe(key, () => {
            before(() => {
              options = parse(value);
            });

            it('should set the help flag to true', () => {
              options.help.should.eql(true);
            });

            it('should not set the error', () => {
              expect(options.error).to.not.be.ok;
            });
          });
        });

        _.forEach({
          'with no options': {
            argv: noOptions,
            debug: DEFAULT_DEBUG_OPTION,
            color: DEFAULT_COLOR_OPTION,
            reset: DEFAULT_RESET_OPTION,
            workingDir: DEFAULT_WORKING_DIR,
            configFile: DEFAULT_CONFIG_FILE,
            name: DEFAULT_MONITOR_NAME,
          },
          'with short options': {
            argv: shortOptions,
            debug: true,
            color: true,
            reset: true,
            workingDir,
            configFile,
            name,
          },
          'with full options': {
            argv: fullOptions,
            debug: true,
            color: true,
            reset: true,
            workingDir,
            configFile,
            name,
          },
          'with negated options': {
            argv: negatedOptions,
            debug: false,
            color: false,
            reset: false,
            workingDir,
            configFile,
            name,
          },
        }, (value, key) => {
          describe(key, () => {
            before(() => {
              options = parse(value.argv);
            });

            it('should set the command', () => {
              options.command.should.eql(command);
            });

            it('should set the args', () => {
              options.args.should.eql([arg1, arg2]);
            });

            it('should set the debug option', () => {
              options.debug.should.eql(value.debug);
            });

            it('should set the color option', () => {
              options.color.should.eql(value.color);
            });

            it('should set the reset option', () => {
              options.reset.should.eql(value.reset);
            });

            it('should set the name', () => {
              options.name.should.eql(value.name);
            });

            it('should set the working directory', () => {
              options.workingDir.should.eql(value.workingDir);
            });

            it('should set the config file', () => {
              options.configFile.should.eql(value.configFile);
            });

            it('should set the help flag to false', () => {
              options.help.should.eql(false);
            });

            it('should set the version flag to false', () => {
              options.version.should.eql(false);
            });

            it('should not set the error', () => {
              expect(options.error).to.not.be.ok;
            });
          });
        });
      });
    });
  });
});
