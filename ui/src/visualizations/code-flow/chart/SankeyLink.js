import styles from "../styles.scss";
import * as d3 from "d3";
import { sankeyLink, sankeyLinkTitle } from "d3-sankey-diagram";

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      link: props.link,
      colorMap: props.colorMap,
      scaleFactor: props.scaleFactor
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      link: nextProps.link,
      colorMap: nextProps.colorMap,
      scaleFactor: nextProps.scaleFactor
    });
  }

  render() {
    if (!this.state.link) {
      return <g />;
    }

    const link = this.state.link;
    const path = sankeyLink()(link);
    const title = sankeyLinkTitle(
      node1 => node1.name,
      node2 => node2.name,
      d3.format(".3s")
    )(link);
    const color = this.state.colorMap(link.type);
    return (
      <g className={styles.link}>
        <path
          d={path}
          style={{
            fill: color
          }}
        />
        <title>
          {title}
        </title>
      </g>
    );
  }
}
