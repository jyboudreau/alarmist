import _ from 'lodash';
import path from 'path';
import blessed from 'blessed';
import Layout from './layout';
import Monitor from './monitor';
import Jobs from './jobs';
import Job from './job';
import logger from './logger';
import {
  UI_LOG,
} from '../../../../constants';
import {
  up,
  down,
  moveUp,
  moveDown,
  toggleExpanded,
} from '../redux/actions';
import {
  MONITOR_LABEL,
} from '../constants';
import {
  CONTAINER_PROPERTIES,
} from './constants';

// istanbul ignore next
function createView(service, store, workingDir) {
  const screen = blessed.screen({
    smartCSR: true,
    log: path.join(workingDir, UI_LOG),
    debug: false,
  });
  logger.log = screen.log.bind(screen);
  logger.debug = screen.debug.bind(screen);
  logger.log('created');
  screen.title = 'alarmist';
  screen.on('keypress', (...args) => {
    logger.debug(args);
  });
  screen.key(['C-c'], async () => {
    await service.stop();
    process.exit(0);
  });
  screen.key(['enter', 'o'], () => store.dispatch(toggleExpanded()));
  const container = blessed.box(CONTAINER_PROPERTIES);
  screen.key(['C-up', 'C-k'], () => {
    container.focus();
    store.dispatch(moveUp());
  });
  screen.key(['C-down', 'C-j', 'linefeed'], () => {
    container.focus();
    store.dispatch(moveDown());
  });
  screen.key(['S-up', 'S-k'], () => {
    container.focus();
    store.dispatch(up());
  });
  screen.key(['S-down', 'S-j'], () => {
    container.focus();
    store.dispatch(down());
  });
  screen.append(container);
  container.key(['up', 'k'], () => store.dispatch(up()));
  container.key(['down', 'j'], () => store.dispatch(down()));
  const layout = new Layout(container);
  const monitor = new Monitor();
  layout.append(MONITOR_LABEL, monitor);
  const jobs = new Jobs(Job, layout);
  const update = () => {
    const state = store.getState();
    monitor.update(state.monitor);
    jobs.update(state.jobs);
    layout.apply(state.layout);
    screen.render();
  };
  store.subscribe(update);
  update();
}

export {createView};
