'use strict';

import Promise from 'bluebird';
import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.js';

import getDummyData from './getDummyData.js';

export const setLinkWidthAttribute= createAction('SET_LINK_WIDTH_ATTRIBUTE');
export const openCommit = createAction('OPEN_COMMIT');

export const requestCodeFlowData = createAction('REQUEST_CODE_FLOW_DATA');
export const receiveCodeFlowData = timestampedActionFactory('RECEIVE_CODE_FLOW_DATA');
export const receiveCodeFlowError = createAction('RECEIVE_CODE_FLOW_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');
export const setViewport = createAction('COR_SET_VIEWPORT');

export default function*() {
  // fetch data once on entry
  yield* fetchCodeFlowData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);

  yield fork(watchOpenCommit);

  // keep looking for viewport changes to re-fetch
  yield fork(watchViewport);
  yield fork(watchRefresh);
  yield fork(watchToggleHelp);
}

function* watchRefreshRequests() {
  yield throttle(2000, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchMessages() {
  yield takeEvery('message', mapSaga(requestRefresh));
}

export function* watchOpenCommit() {
  yield takeEvery('OPEN_COMMIT', function(a) {
    window.open(a.payload.webUrl);
  });
}

function* watchViewport() {
  yield takeEvery('COR_SET_VIEWPORT', mapSaga(requestRefresh));
}

function* watchToggleHelp() {
  yield takeEvery('TOGGLE_HELP', mapSaga(refresh));
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchCodeFlowData);
}

export const fetchCodeFlowData = fetchFactory(
  function*() {
    return yield getDummyData();
  },
  requestCodeFlowData,
  receiveCodeFlowData,
  receiveCodeFlowError
);
