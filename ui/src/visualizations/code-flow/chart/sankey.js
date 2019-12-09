import React from "react";
import { sankey } from "d3-sankey-diagram";
import _ from "lodash";
import * as d3 from "d3";
import SankeyNode from "./SankeyNode.js";
import SankeyLink from "./SankeyLink.js";

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data,
      height: props.height,
      width: props.width,
      linkWidthAttribute: props.linkWidthAttribute,
      scaleFactor: props.scaleFactor
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
      height: nextProps.height,
      width: nextProps.width,
      linkWidthAttribute: nextProps.linkWidthAttribute,
      scaleFactor: nextProps.scaleFactor
    });
  }

  render() {
    if (!this.state.data.nodes) {
      return <g />;
    }

    const { width, height, scaleFactor, data } = this.state;
    const { nodes, links } = sankey()
      .nodeWidth(10)
      .extent([[1, 1], [width*4 - 1, height/2 - 5]])(data);

    const nodeColorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const linkColorMap = linktype => {
      switch (linktype) {
        case "addition":
          return "green";
        case "deletion":
          return "red";
        default:
          return "gray";
      }
    };
    return (
      <g>
        {nodes.map((node, i) =>
          <SankeyNode node={node} colorScale={nodeColorScale} scaleFactor={scaleFactor} key={i} />
        )}
        {links.map((link, i) =>
          <SankeyLink link={link} colorMap={linkColorMap} scaleFactor={scaleFactor} key={i} />
        )}
      </g>
    );
  }
}
