import {createConnection} from 'net';
import {createMonitor} from '../../../src/alarmist/monitor';
import {
  WORKING_DIR,
  PROCESS_LOG,
  READY_RESPONSE,
} from '../../../src/constants.js';
import {
  getControlSocket,
  getLogSocket,
} from '../../../src/alarmist/local-socket';
import path from 'path';
import _rimraf from 'rimraf';
import {readFile as _readFile} from 'fs';
import promisify from '../../../src/utils/promisify';
import _ from 'lodash';

const rimraf = promisify(_rimraf);
const readFile = promisify(_readFile);

const log = Buffer.from('log');
const exitCode = 0;

const processLog = path.join(WORKING_DIR, PROCESS_LOG);

const name = 'job name';
const id = 1;
const startTime = 100000;
const endTime = 200000;

const startEvent = {
  name,
  id,
  startTime,
};

const endMessage = {
  endTime,
  exitCode,
};

const endEvent = {
  name,
  id,
  startTime,
  endTime,
  exitCode,
};

const beginMessage = {
  name,
  id,
};

const logData = 'log data';

const logEvent = {
  name,
  id,
  data: Buffer.from(logData),
};

describe('alarmist', () => {
  describe('createMonitor', () => {
    let monitor;
    beforeEach(async () => {
      await rimraf(WORKING_DIR);
      monitor = await createMonitor();
    });

    it('should open a log stream', async () => {
      monitor.log.should.be.ok;
      await monitor.close();
    });

    describe('should open a control socket', () => {
      let controlConnection;
      beforeEach(async () => {
        controlConnection = createConnection(await getControlSocket());
        await new Promise(
          (resolve) => controlConnection.on('connect', resolve)
        );
      });
      afterEach(async () => {
        controlConnection.end();
        await monitor.close();
      });

      describe('that when it receives a start message', () => {
        let event;
        let ready;
        beforeEach((done) => {
          controlConnection.write(JSON.stringify(startEvent));
          monitor.on('start', (_event) => {
            event = _event;
          });
          controlConnection.once('data', (_ready) => {
            ready = _ready;
            done();
          });
        });

        it('should emit a start event', () => {
          event.should.eql(startEvent);
        });

        it('should notify the job when ready', () => {
          ready.should.eql(Buffer.from(READY_RESPONSE));
        });

        describe('and then recieves an end message', () => {
          beforeEach((done) => {
            controlConnection.write(JSON.stringify(endMessage));
            monitor.on('end', (_event) => {
              event = _event;
              done();
            });
          });

          it('should emit an end event', () => {
            event.should.eql(endEvent);
          });
        });
      });
    });

    describe('should open a log socket', () => {
      let logConnection;
      beforeEach(async () => {
        logConnection = createConnection(await getLogSocket());
        await new Promise((resolve) => logConnection.on('connect', resolve));
      });
      afterEach(async () => {
        logConnection.end();
        await monitor.close();
      });

      describe('that when it receives a begin message', () => {
        let ready;
        beforeEach((done) => {
          logConnection.write(JSON.stringify(beginMessage));
          logConnection.once('data', (_ready) => {
            ready = _ready;
            done();
          });
        });

        it('should notify the job when ready', () => {
          ready.should.eql(Buffer.from(READY_RESPONSE));
        });

        describe('and then recieves data', () => {
          let event;
          beforeEach((done) => {
            logConnection.write(logData);
            monitor.on('log', (_event) => {
              event = _event;
              done();
            });
          });

          it('should emit a log event', () => {
            event.should.eql(logEvent);
          });
        });
      });
    });

    describe('#exit', () => {
      let exitEvent;
      let receivedLog;
      beforeEach(async () => {
        await new Promise((resolve) => {
          monitor.on('exit', (event) => {
            exitEvent = event;
            monitor.cleanup = sinon.spy(() => Promise.resolve());
            resolve();
          });
          receivedLog = Buffer.alloc(0);
          monitor.log.on('data', (data) => {
            receivedLog = Buffer.concat([receivedLog, data]);
          });
          monitor.log.write(log);
          monitor.exit(exitCode);
        });
        await monitor.close();
      });

      it('should write the process log', async () => {
        const _log = await readFile(processLog);
        _log[0].should.eql(log);
      });

      it('should allow log stream to be read', async () => {
        receivedLog.should.eql(log);
      });

      it('should emit an exit event', async () => {
        exitEvent.should.eql(exitCode);
      });
    });

    describe('#close', () => {
      describe('without a cleanup method', () => {
        beforeEach(async () => {
          monitor.log.write(log);
          await monitor.close();
        });

        it('should write the process log', async () => {
          const _log = await readFile(processLog);
          _log[0].should.eql(log);
        });
      });

      describe('with a cleanup method', () => {
        beforeEach(async () => {
          monitor.cleanup = sinon.spy(() => Promise.resolve());
          await monitor.close();
        });

        it('should call the cleanup method', async () => {
          monitor.cleanup.should.have.been.calledOnce;
        });
      });
    });
  });
});
