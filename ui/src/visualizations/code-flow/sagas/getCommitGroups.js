import { graphQl } from "../../../utils";
import mapToSankeyData from "./commitGroupParser"

export default function getCommitGroups() {
  return graphQl
    .query(
      `query {
        commitGroups{
          startCommit{
            sha,
            branches{
            	name
            }
            stats {
              additions
              deletions
            }
          },
          innerCommits{
            sha,
            branches{
            	name
            }
            stats {
              additions
              deletions
            }
          },
          endCommit{
            sha,
            branches{
            	name
            }
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