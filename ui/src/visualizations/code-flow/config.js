'use strict';

import { connect } from 'react-redux';
import { setLinkWidthAttribute, setMode} from './sagas';
import styles from './styles.scss';
import TabCombo from '../../components/TabCombo.js';
import SearchBox from '../../components/SearchBox';
import FilterBox from '../../components/FilterBox';

import { graphQl, emojify } from '../../utils';

const mapStateToProps = (state) => {
  const corState = state.visualizations.codeFlow.state;
  return {
    linkWidthAttribute: corState.config.linkWidthAttribute,
    mode: corState.config.mode
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onChangeLinkWidthAttribute: attr => dispatch(setLinkWidthAttribute(attr)),
    onChangeMode: attr => dispatch(setMode(attr))
  };
};

const CodeFlowConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
      <form>
      <div className="field">
          <div className="control">
            <label className="label">Layer</label>
            <TabCombo
              value={props.mode}
              onChange={value => props.onChangeMode(value)}
              options={[
                { label: 'Branches', icon: 'code-branch', value: 'branches' },
                { label: 'Forks', icon: 'utensils', value: 'forks' }
              ]}
            />
          </div>
        </div>
        <div className="field">
          <div className="control">
            <label className="label">Link width</label>
            <TabCombo
              value={props.mode}
              onChange={value => props.onChangeMode(value)}
              options={[
                { label: 'Static', icon: 'chart-line', value: 'forks' },
                { label: 'Linear', icon: 'chart-line', value: 'branches' },
                { label: 'Logarithmic', icon: 'chart-line', value: 'log' },
              ]}
            />
          </div>      
        </div>
        <div className="field">
          <label className="label">Link Metrik</label>
              <TabCombo
                value={props.mode}
                options={[
                  {label: '# lines changed', icon: 'file-alt', value: 'branches'},
                  {label: '# commits', icon: 'cloud-upload-alt', value: 'commits'}
                ]}
                onChange={value =>  props.onChangeMode(value)}
              />
        </div>
        <div className="field">
             <label className="label">Node settings</label>
             <div><label><input type="checkbox" /> Show CI Status</label> </div>
             <div><label><input type="checkbox" /> Show Contflicts</label></div>
             <div><label><input type="checkbox" /> Show Detailed Metriks</label></div>
        </div>
        
          
        <div className="field">
          <label className="label">Select Issue</label>
          <SearchBox
            placeholder="Select issue..."
            renderOption={i => `#${i.iid} ${i.title}`}
            search={text => {
              return Promise.resolve(
                graphQl.query(
                  `
                  query($q: String) {
                    issues(page: 1, perPage: 50, q: $q, sort: "DESC") {
                      data { iid title createdAt closedAt }
                    }
                  }`,
                  { q: text }
                )
              )
                .then(resp => resp.issues.data)
            }}
            value={props.issue}
          />
          {props.issue &&
            <a href={props.issue.webUrl} target="_blank">
              View #{props.issue.iid} on ITS
            </a>}
        </div>
        <div className="field">
            <label className="label">
              Select Files
            </label>
            <FilterBox
              options={_(["SomeFile.js","SomeOtherFile.js","resource/somedata.json"])
                .map(f => ({
                  label: f,
                  value: f
                }))
                .sortBy('label')
                .value()}
              checkedOptions={props.filteredFiles}
            />
          </div>
      </form>
    </div>
  );
};

const CodeFlowConfig = connect(mapStateToProps, mapDispatchToProps)(
  CodeFlowConfigComponent
);

export default CodeFlowConfig;
