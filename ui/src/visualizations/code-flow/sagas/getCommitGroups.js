import { graphQl } from "../../../utils";
import mapToSankeyData from "./commitGroupParser"

export default function getCommitGroups() {
  return graphQl
    .query(
      `query {
        commitGroups{
          startCommit{
            sha,
            stats {
              additions
              deletions
            }
          },
          innerCommits{
            sha,
            stats {
              additions
              deletions
            }
          },
          endCommit{
            sha,
            stats {
              additions
              deletions
            }
          }
        }
      }`
    )
    .then(resp => {
      return mapToSankeyData(resp.commitGroups);
    });
}