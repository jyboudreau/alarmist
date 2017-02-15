import * as Job from '../../../src/alarmist/job';
import {
  exec,
} from '../../../src/alarmist/exec.js';
import {Writable} from 'stream';

const name = 'name';
const exitCode = 0;
const stdout = Buffer.from('stdout');
const stderr = Buffer.from('stderr');
// eslint-disable-next-line max-len
const command = `node test/bin/command.js ${stdout.toString()} ${stderr.toString()} ${exitCode}`;

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

describe('alarmist', () => {
  describe('exec', () => {
    let job;
    let createJob;
    before(async () => {
      job = {
        stdout: new TestWritable(),
        stderr: new TestWritable(),
        complete: sinon.spy(() => Promise.resolve()),
      };
      createJob = sinon.spy(() => Promise.resolve(job));
      const fnCreateJob = Job.createJob;
      Job.createJob = createJob;
      await exec({
        name,
        command,
      });
      Job.createJob = fnCreateJob;
    });

    it('should create a job', () => {
      createJob.should.have.been.calledWith({
        name,
      });
    });

    it('should pipe to the job stdout', () => {
      job.stdout.buffer.should.eql(stdout);
    });

    it('should pipe to the job stderr', () => {
      job.stderr.buffer.should.eql(stderr);
    });

    it('should complete the job', () => {
      job.complete.should.have.been.calledWith({exitCode});
    });
  });
});
