'use strict';

import { connect } from 'react-redux';
import { setLinkWidthAttribute} from './sagas';
import styles from './styles.scss';

const mapStateToProps = (state) => {
  const corState = state.visualizations.codeFlow.state;

  return {
    linkWidthAttribute: corState.config.linkWidthAttribute
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onChangeLinkWidthAttribute: attr => dispatch(setLinkWidthAttribute(attr))
  };
};

const CodeFlowConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
      <form>
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
