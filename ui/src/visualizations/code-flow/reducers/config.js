'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions(
  {
    SET_LINK_WIDTH_ATTRIBUTE: (state, action) =>
      _.assign({}, state, { linkWidthAttribute: action.payload }),

    COR_SET_VIEWPORT: (state, action) => _.assign({}, state, { viewport: action.payload })
  },
  {
    linkWidthAttribute: 'commitcount',
    viewport: [0, null]
  }
);
