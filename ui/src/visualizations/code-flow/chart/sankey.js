import React from 'react';
import * as d3 from "d3";
import {sankey, sankeyLink, sankeyLinkTitle} from "d3-sankey-diagram"
import styles from '../styles.scss';
import _ from 'lodash';

const SankeyNode = ({node,color}) => {
  return (
    <g transform={`translate(`+node.x0 +`,`+node.y0+`)`}>
      <title>{node.name}</title>
      <text dy="0.35em" textAnchor="start" transform="translate(-4,-10)" >{node.name}</text>
      <rect x="0" y="0" width={node.x1 - node.x0} height={node.y1 - node.y0} fill={color} stroke={d3.rgb(color).darker(2)}>
    </rect>
  </g>
)};


const SankeyLink = ({ link, color }) => {
  return (<g className={styles.link}>
    <path
      d={sankeyLink()(link)}
      style={{
        fill: color,
      }}
    />
    <title>
    {
      sankeyLinkTitle(
              (node1) => node1.name,
              (node2) => node2.name,
              d3.format('.3s')
      )(link)
    }
    </title>
  </g>
)};

export default class extends React.Component {
  constructor() {
    super()

    this.state = {
      data: {},
      height: 100,
      width: 100,
      linkWidthAttribute: "commitcount"
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
      height: nextProps.height,
      width: nextProps.width,
      linkWidthAttribute: nextProps.linkWidthAttribute
    });
  }


  render() {
    if(!this.state.data.nodes){
      return (<g></g>);
    }
    const {width,height,data} = this.state;
    const { nodes, links } = sankey()
      .nodeWidth(20)
      .extent([[1, 1], [width - 1, height - 5]])(data);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const color = (node) => {
      return colorScale(node.name);
    }
    const linkColor = (link) =>{
      if(this.state.linkWidthAttribute === "lineschanged")
      if(link.type==="addition"){
        return "green"
      }else if(link.type==="deletion"){
          return "red"
      }
      return "gray";
    }


    return (
      <g>
        {nodes.map((node, i) => (
          <SankeyNode
            node={node}
            color={color(node)}
            key={i}
          />
        ))}
        {links.map((link, i) => (
          <SankeyLink
            link={link}
            color={linkColor(link)}
            key={i}
          />
        ))}
      </g>
    );
  }
}
