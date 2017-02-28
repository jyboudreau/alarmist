const WORKING_DIR = '.alarmist';
const BLESSED_LOG = 'blessed.log';
const PROCESS_LOG = 'process.log';
const STATUS_FILE = 'status.json';
const ID_FILE = 'id';
const CONTROL_SOCKET = 'control.sock';
const LOG_SOCKET = 'log.sock';
const CONTROL_NAMED_PIPE = '\\\\.\\pipe\\node-alarmist-control';
const LOG_NAMED_PIPE = '\\\\.\\pipe\\node-alarmist-log';
const READY_RESPONSE = 'ready';

module.exports = {
  WORKING_DIR,
  BLESSED_LOG,
  PROCESS_LOG,
  STATUS_FILE,
  ID_FILE,
  CONTROL_SOCKET,
  LOG_SOCKET,
  CONTROL_NAMED_PIPE,
  LOG_NAMED_PIPE,
  READY_RESPONSE,
};
