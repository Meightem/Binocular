import * as d3 from "d3";

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      node: props.node,
      colorScale: props.colorScale
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      node: nextProps.node,
      colorScale: nextProps.colorScale
    });
  }

  render() {
    if (!this.state.node) {
      return <g />;
    }

    const node = this.state.node;
    const color = this.state.colorScale(node.name);
    const borderColor = d3.rgb(color).darker(2);

    const height = Math.max(1,node.y1 - node.y0);
    const width = node.x1 - node.x0;

    return (
      <g transform={`translate(` + node.x0 + `,` + node.y0 + `)`}>
        <title>
          {node.name}
        </title>
        <text dy="0.35em" textAnchor="start" transform="translate(-4,-10)">
          {node.name}
        </text>
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill={color}
          stroke={borderColor}
        />
      </g>
    );
  }
}
