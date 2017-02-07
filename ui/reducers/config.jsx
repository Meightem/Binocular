'use strict';

import { handleActions } from 'redux-actions';
import _ from 'lodash';

export default handleActions( {

  SHOW_CONFIGURATION: (state, action) => _.assign( {}, state, { isShown: true } ),

  HIDE_CONFIGURATION: (state, action) => _.assign( {}, state, { isShown: false } ),

  REQUEST_CONFIGURATION: (state, action) => _.assign( {}, state, { isFetching: true } ),

  RECEIVE_CONFIGURATION: (state, action) => _.merge( {}, state, {
    data: action.payload,
    isFetching: false,
    receivedAt: action.meta.receivedAt
  } )
}, { lastFetched: null, isFetching: null } );