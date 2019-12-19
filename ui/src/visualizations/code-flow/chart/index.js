'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { setViewport, openCommit } from '../sagas';

const mapStateToProps = (state) => {
  const corState = state.visualizations.codeFlow.state;
  return {
    data: corState.data.data,
    linkWidthAttribute: corState.config.linkWidthAttribute,
    mode: corState.config.mode
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onCommitClick: function(c) {
      dispatch(openCommit(c));
    },
    onViewportChanged: function(v) {
      dispatch(setViewport(v));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
