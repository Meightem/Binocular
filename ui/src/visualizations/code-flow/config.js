'use strict';

import { connect } from 'react-redux';
import { setLinkWidthAttribute, setMode} from './sagas';
import styles from './styles.scss';
import TabCombo from '../../components/TabCombo.js';

const mapStateToProps = (state) => {
  const corState = state.visualizations.codeFlow.state;
  return {
    linkWidthAttribute: corState.config.linkWidthAttribute,
    mode: corState.config.mode
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onChangeLinkWidthAttribute: attr => dispatch(setLinkWidthAttribute(attr)),
    onChangeMode: attr => dispatch(setMode(attr))
  };
};

const CodeFlowConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
      <form>
      <div className="field">
          <div className="control">
            <label className="label">Layer</label>
            <TabCombo
              value={props.mode}
              onChange={value => props.onChangeMode(value)}
              options={[
                { label: 'Branches', icon: 'code-fork', value: 'branches' },
                { label: 'Forks', icon: 'cutlery', value: 'forks' }
              ]}
            />
          </div>
        </div>
        <div className="field">
          <div className="control">
            <label className="label">Link width:</label>
            <label className="radio">
              <input
                name="linkWidthAttribute"
                type="radio"
                checked={props.linkWidthAttribute === 'commitcount'}
                onChange={() => props.onChangeLinkWidthAttribute('commitcount')}
              />
              Commit Count
            </label>
            <label className="radio">
              <input
                name="linkWidthAttribute"
                type="radio"
                checked={props.linkWidthAttribute === 'lineschanged'}
                onChange={() => props.onChangeLinkWidthAttribute('lineschanged')}
              />
              Line Changes
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

const CodeFlowConfig = connect(mapStateToProps, mapDispatchToProps)(
  CodeFlowConfigComponent
);

export default CodeFlowConfig;
