import {
  EXEC_CMD,
  MONITOR_CMD,
} from './constants';
import minimist from 'minimist';
import alarmist from '.';
import ui from './cli/ui';

const commands = {
  [EXEC_CMD]: (args) => {
    return alarmist.exec(args);
  },
  [MONITOR_CMD]: (args) => {
    return alarmist.createMonitor(args)
    .then(ui.createUi);
  },
};

module.exports = function cli(argv) {
  const args = minimist(argv, {
    string: ['group', 'name', 'command'],
    alias: {
      group: 'g',
      name: 'n',
      command: 'c',
    },
  });
  return commands[args._[0]](args);
};
