import _ from 'lodash';
import {createJob} from './job';

export function createJobs(service, layout) {
  const jobs = {};
  return {
    update: (state) => {
      _.forOwn(state, (status, name) => {
        const existing = jobs[name];
        if (_.isUndefined(existing)) {
          const job = createJob(name, service, layout);
          jobs[name] = {
            job: job,
            status: status,
          };
          job.update(status);
        } else {
          if (status !== existing.status) {
            existing.job.update(status);
          }
        }
      });
    },
  };
}
