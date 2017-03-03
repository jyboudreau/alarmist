import * as Monitor from '../../../src/alarmist/monitor';
import {
  exec,
} from '../../../src/alarmist/monitor-exec.js';
import {Writable} from 'stream';
import chokidar from 'chokidar';
import path from 'path';
import {
  WORKING_DIR,
} from '../../../src/constants';
import promisify from '../../../src/utils/promisify';
import _rimraf from 'rimraf';
import _mkdirp from 'mkdirp';

const rimraf = promisify(_rimraf);
const mkdirp = promisify(_mkdirp);

const exitCode = 0;
const stdout = Buffer.from('stdout');
const stderr = Buffer.from('stderr');
const all = Buffer.concat([stdout, stderr]);
const command = 'node';
const exitingArgs = [
  'test/bin/command.js',
  stdout.toString(),
  stderr.toString(),
  exitCode,
];
const livingArgs = [
  'test/bin/service.js',
  stdout.toString(),
  stderr.toString(),
];

class TestWritable extends Writable {
  constructor(options) {
    super(options);
    this.buffer = Buffer.alloc(0);
  }
  _write(chunk, encoding, callback) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    callback();
  }
}

function waitForFile(file) {
  return new Promise((resolve) => {
    const watcher = chokidar.watch(WORKING_DIR).on('add', (newFile) => {
      if (newFile === file) {
        watcher.close();
        resolve();
      }
    });
  });
};

let monitor;

describe('alarmist', function() {
  describe('execMonitor', () => {
    describe('with a process that exits', () => {
      before(async function() {
        // eslint-disable-next-line no-invalid-this
        this.timeout(5000);
        let execMonitor;
        await new Promise(async (resolve) => {
          monitor = {
            log: new TestWritable(),
            close: sinon.spy(() => Promise.resolve()),
            end: sinon.spy(resolve),
          };
          sinon.stub(
            Monitor,
            'createMonitor',
            async () => Promise.resolve(monitor)
          );
          execMonitor = await exec({
            command,
            args: exitingArgs,
          });
        });
        await execMonitor.close();
      });
      after(() => {
        Monitor.createMonitor.restore();
      });

      it('should create a monitor', () => {
        Monitor.createMonitor.should.have.been.calledOnce;
      });

      it('should pipe to the monitor log', () => {
        monitor.log.buffer.should.eql(all);
      });

      it('should call end', () => {
        monitor.end.should.have.been.calledWith(`exit code: ${exitCode}`);
      });

      it('should close the monitor', () => {
        monitor.close.should.have.been.calledOnce;
      });
    });

    describe('with a process that lives', () => {
      before(async function() {
        // eslint-disable-next-line no-invalid-this
        this.timeout(5000);
        await rimraf(WORKING_DIR);
        await mkdirp(WORKING_DIR);
        let execMonitor;
        monitor = {
          log: new TestWritable(),
          close: sinon.spy(async () => {
            await monitor.cleanup();
          }),
        };
        sinon.stub(
          Monitor,
          'createMonitor',
          async () => Promise.resolve(monitor)
        );
        const waitPromise = waitForFile(path.join(WORKING_DIR, 'done'));
        execMonitor = await exec({
          command,
          args: livingArgs,
        });
        await waitPromise;
        await execMonitor.close();
      });
      after(() => {
        Monitor.createMonitor.restore();
      });

      it('should create a monitor', () => {
        Monitor.createMonitor.should.have.been.calledOnce;
      });

      it('should pipe to the monitor log', () => {
        monitor.log.buffer.should.eql(all);
      });

      it('should close the monitor', () => {
        monitor.close.should.have.been.calledOnce;
      });
    });
  });
});
