import _ from 'lodash';
import helper from '../../../../helpers/blessed';
import blessed from 'blessed';
import Entry from '../../../../../src/cli/ui/view/entry';
import {
  HEADER_PROPERTIES,
  LOG_PROPERTIES,
} from '../../../../../src/cli/ui/view/constants';

let entry;
const state = {};
const container = {
  append: sinon.spy(),
};

describe('cli', () => {
  describe('ui', () => {
    describe('view', () => {
      describe('Entry', () => {
        before(() => {
          blessed.text.reset();
          blessed.box.reset();
          entry = new Entry();
          sinon.spy(entry, '_update');
          sinon.spy(entry, '_setLog');
        });

        it('should construct the header', () => {
          blessed.text.should.have.been.calledWith(HEADER_PROPERTIES);
        });

        it('should construct the log', () => {
          blessed.box.should.have.been.calledWith(LOG_PROPERTIES);
        });

        it('should clear the log', () => {
          helper.box.content.should.eql('');
        });

        describe('setParent', () => {
          before(() => {
            container.append.reset();
            entry.setParent(container);
          });

          it('should append the header', () => {
            container.append.should.have.been.calledWith(helper.text);
          });

          it('should append the log', () => {
            container.append.should.have.been.calledWith(helper.box);
          });
        });

        describe('update', () => {
          before(() => {
            entry._update.reset();
            entry.update(state);
          });

          it('should update the state', () => {
            entry._update.should.have.been.calledWith(state);
          });

          describe('with the same state', () => {
            before(() => {
              entry._update.reset();
              entry.update(state);
            });

            it('should update the state', () => {
              entry._update.should.not.have.been.called;
            });
          });
        });

        describe('setHeader', () => {
          before(() => {
            helper.text.content = undefined;
            helper.text.style.bg = undefined;
            entry.setHeader('content', 'color');
          });

          it('should set the header content', () => {
            helper.text.content.should.eql('content');
          });

          it('should set the header color', () => {
            helper.text.style.bg.should.eql('color');
          });
        });

        describe('clear', () => {
          before(() => {
            helper.box.content = 'log data';
            entry.clear();
          });

          it('should clear the log box', () => {
            helper.box.content.should.eql('');
          });
        });

        describe('_setLog', () => {
          before(() => {
            helper.box.content = '';
            entry._setLog(Buffer.from('log data'));
          });

          it('should set the log box content', () => {
            helper.box.content.should.eql('log data');
          });
        });

        describe('setLog', () => {
          const buffer = Buffer.from('log data');
          before(() => {
            entry.setLog(buffer);
          });

          it('should set the log box content', () => {
            entry._setLog.should.have.been.calledWith(buffer);
          });

          describe('when called with the same buffer', () => {
            before(() => {
              entry._setLog.reset();
              entry.setLog(buffer);
            });

            it('should not set the log box content', () => {
              entry._setLog.should.not.have.been.called;
            });
          });
        });

        describe('getHeaderHeight', () => {
          it('should return the header height', () => {
            entry.getHeaderHeight().should.eql(HEADER_PROPERTIES.height);
          });
        });

        describe('setLogHeight', () => {
            before(() => {
              helper.box.height = undefined;
              entry.setLogHeight(10);
            });

          it('should set the log height', () => {
            helper.box.height.should.eql(10);
          });
        });

        describe('setTop', () => {
          before(() => {
            helper.text.top = undefined;
            helper.box.top = undefined;
            entry.setTop(10);
          });

          it('should set the header top', () => {
            helper.text.top.should.eql(10);
          });

          it('should set the log top', () => {
            helper.box.top.should.eql(10 + entry.getHeaderHeight());
          });
        });

        describe('collapse', () => {
          before(() => {
            helper.box.hide.reset();
            entry.collapse();
          });

          it('should hide the log', () => {
            helper.box.hide.should.have.been.calledOnce;
          });
        });

        describe('expand', () => {
          before(() => {
            helper.box.show.reset();
            entry.expand();
          });

          it('should show the log', () => {
            helper.box.show.should.have.been.calledOnce;
          });
        });

        describe('focus', () => {
          before(() => {
            helper.box.focus.reset();
            entry.focus();
          });

          it('should focus the log', () => {
            helper.box.focus.should.have.been.calledOnce;
          });
        });
      });
    });
  });
});
