'use strict';

import React from 'react';
import _ from 'lodash';
import styles from './sidebar.css';
import PanelLink from './PanelLink.jsx';

import classnames from 'classnames';

export default class SidebarPanel extends React.Component {
  render() {

    const links = _.map( this.props.visualizations, vis => {
      return (
        <PanelLink key={vis.id} visualization={vis}></PanelLink>
      );
    } );

    return (
      <nav className={classnames('panel', styles.sidebar)}>
        <p className='panel-heading'>
          Visualizations
        </p>
        <p className='panel-tabs'>
          {links}
        </p>
      </nav>
    );
  }
}