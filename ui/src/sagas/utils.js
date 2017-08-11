'use strict';

import { createAction } from 'redux-actions';
import { call, put } from 'redux-saga/effects';

export function fetchFactory(fn, requestActionCreator, receiveActionCreator, errorActionCreator) {
  return function*(...args) {
    yield put(requestActionCreator());
    let result = null;
    try {
      result = yield call(fn, ...args);
      yield put(receiveActionCreator(result));
    } catch (e) {
      if (errorActionCreator) {
        yield put(errorActionCreator(e));
      } else {
        throw e;
      }
    }
  };
}

export function timestampedActionFactory(action) {
  return createAction(action, id => id, () => ({ receivedAt: new Date() }));
}
