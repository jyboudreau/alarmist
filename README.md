# alarmist

[![Build Status](https://travis-ci.org/pghalliday/alarmist.svg?branch=master)](https://travis-ci.org/pghalliday/alarmist)
[![Coverage Status](https://coveralls.io/repos/github/pghalliday/alarmist/badge.svg?branch=master)](https://coveralls.io/github/pghalliday/alarmist?branch=master)

Monitor parallel jobs

![alt Alarmist UI](https://raw.githubusercontent.com/pghalliday/alarmist/master/alarmist.png "Alarmist UI")

## Install

```
npm install --save-dev alarmist
```

## CLI

Execute a job

```
alarmist-job -n name my-command [args...]
```

Monitor jobs

```
alarmist-monitor my-watch-command [args...]
```

Jobs will appear on first run and can be expanded (one at a time) to display logs

- [CTRL-c] - stop the monitor
- [up, down, j, k] -  select a job
- [enter, o] - expand/collapse job logs
  - [up, down, j, k, g, SHIFT-g] - navigate log when expanded

**NB. By default many commands will not produce colored output when run like this, however many commands also have options to force colors. Eg. many node CLI tools use the `chalk` library and so will have a `--color` option or support the `FORCE_COLOR=true` environment variable**

All the logs and status files will also be captured in the `.alarmist` working directory with the following structure

```
.
└── .alarmist/
    ├── ui.log - internal UI logging for debug purposes
    ├── monitor.log - the monitor command's log
    ├── control.sock - unix socket or windows named pipe information that jobs use to notify the monitor on status change
    ├── log.sock - unix socket or windows named pipe information that jobs use to pipe logs to the monitor
    └── jobs/
      └── [name]
          ├── last-run - the last run number
          └── [run number]/
              ├── run.log - the job run's log
              └── status.json - the job run's status
```

**NB. The `.alarmist` working directory will be reset every time the monitor is started**

## API

```javascript
var alarmist = require('alarmist');
```

### Custom jobs

Create a job.

```javascript
alarmist.createJob('name')]
.then(function(job) {
  ...
});
```

The job will expose a `log` write stream that you can use for logging.

```javascript
job.log.write('this gets logged');
```

When the job is complete call the `end` method and optionally signal failure with an error message (should be string)

```javascript
job.end(error)
.then(function() {
  ...
});
```

### Execute a job

```javascript
alarmist.execJob({
  name: 'name',
  command: 'my-command',
  args: []
}).then(function() {
  ...
});
```

## Monitor jobs and execute a watcher

Start a monitor and watcher process

```javascript
alarmist.execMonitor({
  command: 'my-watcher-command',
  args: []
})
.then(function(monitor) {
  ...
});
```

Listen for start events when jobs start

```javascript
monitor.on('run-start', function(job) {
  console.log(job.id);
  console.log(job.name);
  console.log(job.startTime);
});
```

Listen for log events when jobs log data

```javascript
monitor.on('run-log', function(job) {
  console.log(job.id);
  console.log(job.name);
  console.log(job.data); // this should be a Buffer
});
```

Listen for end events when jobs end

```javascript
monitor.on('run-end', function(job) {
  console.log(job.id);
  console.log(job.name);
  console.log(job.startTime);
  console.log(job.endTime);
  console.log(job.error);
});
```

Read from the monitor log stream, for logging from the watcher command

```javascript
monitor.log.on('data', function(data) {
  console.log(data) // this shoud be a Buffer
});
```

Listen for an `end` event that signifies an error as the watcher process should not exit

```javascript
monitor.on('end', function(error) {
  console.log(error);
});
```

Stop a monitor

```javascript
monitor.close();
```

### Monitor jobs with your own watcher

Start a monitor

```javascript
alarmist.createMonitor()
.then(function(monitor) {
  // create and manage your watcher
  ...
});
```

Listen for job events as above

Log for your watcher process

```javascript
monitor.log.write('output');
```

Signal the end of the watcher routine (watcher routines aren't meant to end so this is really signalling an error)

```javascript
// provide an error string
monitor.end(error);
```

Listen for end events and close the monitor as above

## Contributing

Run tests, etc before pushing changes/opening a PR

- `npm test` - lint and test
- `npm run build` - run tests then build
- `npm run watch` - watch for changes and run build
- `npm run ci` - run build and submit coverage to coveralls
- `npm start` - use alarmist to monitor its own build tasks in parallel :)
