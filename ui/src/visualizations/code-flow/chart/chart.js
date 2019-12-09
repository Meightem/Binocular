"use strict";

import React from "react";
import * as d3 from "d3";

import styles from "../styles.scss";
import _ from "lodash";

import Legend from "../../../components/Legend";
import ChartContainer from "../../../components/svg/ChartContainer.js";
import GlobalZoomableSvg from "../../../components/svg/GlobalZoomableSvg.js";
import OffsetGroup from "../../../components/svg/OffsetGroup.js";
import * as zoomUtils from "../../../utils/zoom.js";
import Sankey from "./sankey.js";

export default class CodeFlow extends React.Component {
  constructor(props) {
    super(props);

    this.elems = {};
    const { data, linkWidthAttribute } = this.extractCommitData(props);

    this.state = {
      data: data,
      linkWidthAttribute: linkWidthAttribute,
      transform: d3.zoomIdentity,
      dimensions: zoomUtils.initialDimensions(),
    };

    this.onZoom = zoomUtils.onZoomFactory({ constrain: false });
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
    const transform = this.state.transform;
    const sankeyData = this.state.data;
    return (
      <ChartContainer onResize={evt => this.onResize(evt)}>
        <GlobalZoomableSvg
          className={styles.chart}
          scaleExtent={[1, 10]}
          onZoom={evt => this.onZoom(evt)}
          transform={transform}
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
            <OffsetGroup dims={dims} transform={transform}>
              <Sankey
                data={sankeyData}
                linkWidthAttribute={this.state.linkWidthAttribute}
                width={dims.width}
                height={dims.height}
                scaleFactor={transform.k}
              />
            </OffsetGroup>
          </g>
        </GlobalZoomableSvg>
      </ChartContainer>
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
