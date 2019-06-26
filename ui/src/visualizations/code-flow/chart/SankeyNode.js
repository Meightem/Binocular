import * as d3 from "d3";
import styles from "../styles.scss";

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      node: props.node,
      colorScale: props.colorScale,
      scaleFactor: props.scaleFactor
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      node: nextProps.node,
      colorScale: nextProps.colorScale,
      scaleFactor: nextProps.scaleFactor
    });
  }

  render() {
    if (!this.state.node) {
      return <g />;
    }

    const node = this.state.node;
    const color = this.state.colorScale(node.name);
    const borderColor = d3.rgb(color).darker(2);
    const scaleFactor = this.state.scaleFactor;

    const height = Math.max(1, node.y1 - node.y0);
    const width = node.x1 - node.x0;
    const textOffsetX = -4 / scaleFactor;
    const textOffsetY = -10 / scaleFactor;
    const fontSize = 1 / scaleFactor + "rem";
    return (
      <g transform={`translate(` + node.x0 + `,` + node.y0 + `)`}>
        <title>
          {node.name}
        </title>
        <text
          dy="0.35em"
          textAnchor="start"
          transform={`translate(` + textOffsetX + `,` + textOffsetY + `)`}
          style={{ fontSize: fontSize }}
        >
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
