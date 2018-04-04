import _ from 'lodash';
import appendBuffer from '../../../utils/append-buffer';
import appendLines from '../../../utils/append-lines';
import {combineReducers} from 'redux';
import {handleActions} from 'redux-actions';
import {
  reset,
  end,
  runStart,
  runEnd,
  select,
  up,
  down,
  moveUp,
  moveDown,
  toggleExpanded,
  log,
  runLog,
  resize,
} from './actions';
import {
  MONITOR_LABEL,
  TYPE_JOB,
  TYPE_SERVICE,
  TYPE_METRIC,
  TYPE_TABLE,
} from '../constants';
import {
  jobLabel,
} from '../helpers';

const MAX_BUFFER_LENGTH = 100000;
const MAX_LINES_LENGTH = 10000;
const MAX_LINE_LENGTH = 1000;

const initialMonitor = {
  log: Buffer.alloc(0),
};

const initialJob = {
  type: TYPE_JOB,
  log: Buffer.alloc(0),
};

const initialService = {
  type: TYPE_SERVICE,
  log: Buffer.alloc(0),
};

const initialMetric = {
  type: TYPE_METRIC,
  // always start with 1 incomplete line
  lines: [''],
};

const initialTable = {
  type: TYPE_TABLE,
};

const monitor = handleActions({
  [reset]: () => initialMonitor,
  [end]: (monitor, {payload}) => {
    return Object.assign({}, monitor, {
      error: payload,
    });
  },
  [log]: (monitor, {payload}) => {
    return Object.assign({}, monitor, {
      log: appendBuffer(MAX_BUFFER_LENGTH, monitor.log, payload),
    });
  },
}, initialMonitor);

const initialJobs = {};

const jobs = handleActions({
  [reset]: () => initialJobs,
  [runStart]: (jobs, {payload}) => {
    let initialState = initialJob;
    if (payload.table) {
      initialState = initialTable;
    } else if (payload.metric) {
      initialState = initialMetric;
    } else if (payload.service) {
      initialState = initialService;
    }
    const name = payload.name;
    const existing = jobs[name];
    if (!_.isUndefined(existing) && existing.id > payload.id) {
      return jobs;
    }
    return Object.assign({}, jobs, {
      [name]: Object.assign({}, payload, initialState),
    });
  },
  [runLog]: (jobs, {payload}) => {
    const name = payload.name;
    const job = jobs[name];
    if (!_.isUndefined(job) && payload.id === job.id) {
      switch (job.type) {
        case TYPE_JOB:
        case TYPE_SERVICE:
          return Object.assign({}, jobs, {
            [name]: Object.assign({}, job, {
              log: appendBuffer(MAX_BUFFER_LENGTH, job.log, payload.data),
            }),
          });
        case TYPE_METRIC:
          return Object.assign({}, jobs, {
            [name]: Object.assign({}, job, {
              lines: appendLines(
                MAX_LINES_LENGTH,
                MAX_LINE_LENGTH,
                job.lines,
                payload.data
              ),
            }),
          });
        case TYPE_TABLE:
          return Object.assign({}, jobs, {
            [name]: Object.assign({}, job, {
            }),
          });
      }
    }
    return jobs;
  },
  [runEnd]: (jobs, {payload}) => {
    const name = payload.name;
    const job = jobs[name];
    if (!_.isUndefined(job) && payload.id === job.id) {
      return Object.assign({}, jobs, {
        [name]: Object.assign({}, job, payload),
      });
    }
    return jobs;
  },
}, initialJobs);

const initialLayout = {
  lines: [
    MONITOR_LABEL,
  ],
  selected: 0,
  expanded: false,
  width: 0,
  height: 0,
};

const layout = handleActions({
  [reset]: () => initialLayout,
  [resize]: (layout, {payload}) => {
    return Object.assign({}, layout, {
      width: payload.width,
      height: payload.height,
    });
  },
  [runStart]: (layout, {payload}) => {
    const entry = jobLabel(payload.name);
    const lines = layout.lines;
    const index = _.indexOf(lines, entry);
    if (index === -1) {
      return Object.assign({}, layout, {
        lines: lines.concat([entry]),
      });
    }
    return layout;
  },
  [select]: (layout, {payload}) => {
    const index = _.indexOf(layout.lines, payload);
    const changed = index !== layout.selected;
    return Object.assign({}, layout, {
      selected: index,
      expanded: changed || !layout.expanded,
    });
  },
  [down]: (layout) => {
    const selected = layout.selected;
    const maxSelected = layout.lines.length - 1;
    if (selected < maxSelected) {
      return Object.assign({}, layout, {
        selected: selected + 1,
      });
    }
    return layout;
  },
  [up]: (layout) => {
    const selected = layout.selected;
    if (selected > 0) {
      return Object.assign({}, layout, {
        selected: selected - 1,
      });
    }
    return layout;
  },
  [moveDown]: (layout) => {
    const selected = layout.selected;
    const lines = layout.lines;
    const maxSelected = layout.lines.length - 1;
    if (selected < maxSelected) {
      return Object.assign({}, layout, {
        selected: selected + 1,
        lines: lines.slice(0, selected).concat(
          lines[selected + 1],
          lines[selected],
          lines.slice(selected + 2),
        ),
      });
    }
    return layout;
  },
  [moveUp]: (layout) => {
    const selected = layout.selected;
    const lines = layout.lines;
    if (selected > 0) {
      return Object.assign({}, layout, {
        selected: selected - 1,
        lines: lines.slice(0, selected - 1).concat(
          lines[selected],
          lines[selected - 1],
          lines.slice(selected + 1),
        ),
      });
    }
    return layout;
  },
  [toggleExpanded]: (layout) => {
    return Object.assign({}, layout, {
      expanded: !layout.expanded,
    });
  },
}, initialLayout);

export default combineReducers({
  monitor,
  jobs,
  layout,
});
