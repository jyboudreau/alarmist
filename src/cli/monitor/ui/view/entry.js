import _ from 'lodash';
import {copy} from 'copy-paste';
import blessed from 'blessed';
import {
  HEADER_PROPERTIES,
  LOG_PROPERTIES,
} from './constants';
import EventEmitter from 'events';

export default class Entry extends EventEmitter {
  constructor() {
    super();
    this.scrollOnExpand = true;
    this.expanded = false;
    this.header = blessed.text(_.cloneDeep(HEADER_PROPERTIES));
    this.header.on('click', () => {
      this.emit('select');
    });
    this.log = blessed.box(_.cloneDeep(LOG_PROPERTIES));
    this.log.key(['y'], () => copy(this.log.getText()));
    this.log.key(['S-y'], () => copy(this.log.getContent()));
    this.log.on('mouse', (event) => {
      // istanbul ignore else
      if (event.action === 'mousedown') {
        // istanbul ignore else
        if (event.shift) {
          if (event.button === 'left') {
            copy(this.log.getText());
          }
          if (event.button === 'right') {
            copy(this.log.getContent());
          }
        }
      }
    });
    this.log.hide();
    this.clear();
  }
  setParent(container) {
    container.append(this.header);
    container.append(this.log);
  }
  _update() {
  }
  update(state) {
    if (this.state !== state) {
      this.state = state;
      this._update(state);
    }
  }
  setHeader(content, color) {
    this.header.setContent(content);
    this.header.style.bg = color;
  }
  clear() {
    this.log.setContent('');
  }
  // istanbul ignore next
  _setLog(data) {
    let scroll = false;
    let scrolling = false;
    const height = this.log.height;
    if (this.expanded) {
      const beforeLineCount = this.log.getLines().length;
      if (beforeLineCount > height) {
        scrolling = true;
        scroll = this.log.getScrollPerc() === 100;
      }
    }
    this.log.setContent(data.toString());
    if (this.expanded) {
      if (!scroll) {
        const afterLineCount = this.log.getLines().length;
        if (!scrolling) {
          scroll = afterLineCount > height;
        }
      }
      if (scroll) {
        this.log.setScrollPerc(100);
      }
    }
  }
  setLog(data) {
    if (data !== this.logData) {
      this.logData = data;
      this._setLog(data);
    }
  }
  getHeaderHeight() {
    return this.header.height;
  }
  setLogHeight(height) {
    this.log.height = height;
  }
  setTop(top) {
    this.header.top = top;
    this.log.top = top + this.header.height;
  }
  // istanbul ignore next
  collapse() {
    if (this.expanded) {
      const height = this.log.height;
      const lineCount = this.log.getLines().length;
      if (lineCount <= height) {
        this.scrollOnExpand = true;
      } else {
        this.scrollOnExpand = this.log.getScrollPerc() === 100;
      }
      this.expanded = false;
      this.log.hide();
    }
  }
  // istanbul ignore next
  expand() {
    if (!this.expanded) {
      this.log.show();
      this.expanded = true;
      if (this.scrollOnExpand) {
        const height = this.log.height;
        const lineCount = this.log.getLines().length;
        if (lineCount > height) {
          this.log.setScrollPerc(100);
        }
      }
    }
  }
  focus() {
    this.log.focus();
  }
}
