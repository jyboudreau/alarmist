import logger from '../cli/ui/view/logger';
import * as Monitor from './monitor';
import spawn from 'cross-spawn';

// tree-kill gives us a cross-platform
// way to kill children and grandchildren, etc
import kill from 'tree-kill';

export async function exec({command, args}) {
  const monitor = await Monitor.createMonitor();
  const proc = spawn(command, args, {
    env: Object.assign({}, process.env, {FORCE_COLOR: true}),
  });
  let expectExit = false;
  const exitPromise = new Promise((resolve) => {
    proc.on('exit', async (code) => {
      if (!expectExit) {
        delete monitor.cleanup;
        monitor.end(`exit code: ${code}`);
      }
      resolve();
    });
  });
  proc.stdout.pipe(monitor.log);
  proc.stderr.pipe(monitor.log);
  monitor.cleanup = async () => {
    logger.log('cleanup');
    expectExit = true;
    kill(proc.pid);
    await exitPromise;
  };
  return monitor;
}
