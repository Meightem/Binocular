'use strict';

import cx from 'classnames';

import styles from './styles.scss';

export default () =>
  <div className={cx('box', styles.help)}>
    <h1 className="title">Code Flow Help</h1>
    <p>
      This chart shows the code flow through different branches, forks and merges.
      Every branch has its own color.
    </p>
  </div>;
