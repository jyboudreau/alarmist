'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var RIGHT_POINTER = exports.RIGHT_POINTER = '\u25BA';
var DOWN_POINTER = exports.DOWN_POINTER = '\u25BC';

var CONTAINER_PROPERTIES = exports.CONTAINER_PROPERTIES = {
  width: '100%',
  height: '100%',
  autoFocus: false
};

var HEADER_PROPERTIES = exports.HEADER_PROPERTIES = {
  left: 2,
  width: '100%',
  height: 1,
  style: {
    fg: 'black'
  },
  autoFocus: false
};

var SELECTED_INDICATOR_PROPERTIES = exports.SELECTED_INDICATOR_PROPERTIES = {
  left: 0,
  height: 1,
  autoFocus: false
};

var LOG_PROPERTIES = exports.LOG_PROPERTIES = {
  left: 3,
  width: '100%-3',
  height: 0,
  keys: true,
  mouse: true,
  vi: true,
  scrollable: true,
  alwaysScroll: true,
  scrollbar: {
    ch: ' ',
    inverse: true
  },
  autoFocus: false
};

var CHART_PROPERTIES = exports.CHART_PROPERTIES = {
  left: 3,
  width: '100%-3',
  height: 0,
  autoFocus: false
};

var CHART_PADDING = exports.CHART_PADDING = '          ';

var TABLE_PROPERTIES = exports.TABLE_PROPERTIES = {
  left: 3,
  width: '100%-3',
  height: 0,
  autoFocus: false
};