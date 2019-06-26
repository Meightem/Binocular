"use strict";

import React from "react";
import * as d3 from "d3";

import styles from "../styles.scss";
import _ from "lodash";

import Legend from "../../../components/Legend";
import ZoomableChartContainer from "../../../components/svg/ZoomableChartContainer.js";
import OffsetGroup from "../../../components/svg/OffsetGroup.js";
import * as zoomUtils from "../../../utils/zoom.js";
import Sankey from "./Sankey.js";

export default class CodeFlow extends React.Component {
  constructor(props) {
    super(props);

    this.elems = {};
    const { data, linkWidthAttribute } = this.extractCommitData(props);

    this.state = {
      dimensions: zoomUtils.initialDimensions(),
      data: data,
      linkWidthAttribute: linkWidthAttribute
    };

    this.onZoom = zoomUtils.onZoomFactory({ constrain: true, margin: 50 });
    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
  }

  componentWillReceiveProps(nextProps) {
    const { data, linkWidthAttribute } = this.extractCommitData(nextProps);
    this.setState({
      data: data,
      linkWidthAttribute: linkWidthAttribute
    });
  }

  render() {
    if (!this.props.data) {
      return <svg />;
    }

    const dims = this.state.dimensions;
    const sankeyData = this.state.data;
    return (
      <ZoomableChartContainer
        className={styles.chart}
        scaleExtent={[1, 100]}
        onZoom={evt => {
          this.onZoom(evt);
        }}
        onResize={dims => this.onResize(dims)}
      >
        <g>
          <defs>
            <clipPath id="chart">
              <rect x="0" y="0" width={dims.width} height={dims.height} />
            </clipPath>
            <clipPath id="x-only">
              <rect
                x="0"
                y={-dims.hMargin}
                width={dims.width}
                height={dims.fullHeight}
              />
            </clipPath>
          </defs>
          <OffsetGroup dims={dims} transform={this.state.transform}>
            <Sankey
              data={sankeyData}
              linkWidthAttribute={this.state.linkWidthAttribute}
              width={dims.width}
              height={dims.height}
            />
          </OffsetGroup>
        </g>
      </ZoomableChartContainer>
    );
  }

  extractCommitData(props) {
    if (!props.data) {
      return {};
    }
    return {
      data: props.data,
      linkWidthAttribute: props.linkWidthAttribute
    };
  }
}
