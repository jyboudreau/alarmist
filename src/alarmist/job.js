import {
  WORKING_DIR,
  ID_FILE,
  STATUS_FILE,
  STDOUT_LOG,
  STDERR_LOG,
  ALL_LOG,
} from '../constants';
import _mkdirp from 'mkdirp';
import {
  writeFile as _writeFile,
  createWriteStream,
} from 'fs';
import path from 'path';
import promisify from '../utils/promisify';
import {PassThrough} from 'stream';
import _id from '../utils/id';

const mkdirp = promisify(_mkdirp);
const writeFile = promisify(_writeFile);

export async function createJob({name}) {
  const jobDir = path.join(WORKING_DIR, name);
  const idFile = path.join(jobDir, ID_FILE);
  const id = await _id.getId(idFile);
  const reportDir = path.join(jobDir, id);
  const statusFile = path.join(reportDir, STATUS_FILE);
  const startTime = Date.now();
  await mkdirp(reportDir);
  await writeFile(statusFile, JSON.stringify({
    startTime,
  }));
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const stdoutStream = createWriteStream(path.join(reportDir, STDOUT_LOG));
  const stderrStream = createWriteStream(path.join(reportDir, STDERR_LOG));
  const allStream = createWriteStream(path.join(reportDir, ALL_LOG));
  stdout.pipe(stdoutStream);
  stdout.pipe(allStream);
  stderr.pipe(stderrStream);
  stderr.pipe(allStream);
  const streamEndPromises = [
    new Promise((resolve) => stdoutStream.on('close', resolve)),
    new Promise((resolve) => stderrStream.on('close', resolve)),
    new Promise((resolve) => allStream.on('close', resolve)),
  ];
  return {
    stdout,
    stderr,
    exit: async (exitCode) => {
      stdout.end();
      stderr.end();
      await Promise.all(streamEndPromises);
      await writeFile(statusFile, JSON.stringify({
        exitCode,
        startTime,
        endTime: Date.now(),
      }));
    },
  };
}
