'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_ACTIVE_ISSUE: (state, action) => _.assign({}, state, { activeIssue: action.payload })
  },
  { activeIssueId: 1 }
);
