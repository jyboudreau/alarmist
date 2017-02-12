import * as Job from './job';
import {exec as cpExec} from 'child_process';

export async function exec({group, name, command}) {
  const job = await Job.createJob({group, name});
  await new Promise((resolve) => {
    const proc = cpExec(command).on('exit', async (exitCode) => {
      await job.complete({exitCode});
      resolve();
    });
    proc.stdout.pipe(job.stdout);
    proc.stderr.pipe(job.stderr);
  });
}
