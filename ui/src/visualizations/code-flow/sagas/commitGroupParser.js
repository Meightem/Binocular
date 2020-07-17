export default function mapToSankeyData(data){
  if(!data){
    return undefined;
  }
  let nodes = [];
  let branchMap = new Object();
  let links = [];
  let counter = 1;
  let map = new Object();
  

  const filteredCommitGroups = filterOutForcedFFMerges(data);

  // Create map for commits sha to simple integers
  // Add all nodes
  filteredCommitGroups.forEach(commitGroup => {
    const { startCommit, innerCommits, endCommit } = commitGroup;
    if (nodes.indexOf(startCommit.sha) === -1) {
      nodes.push(startCommit.sha);
      branchMap[startCommit.sha] = startCommit.branches;
      map[startCommit.sha] = counter++;
    }
    if (nodes.indexOf(endCommit.sha) === -1) {
      nodes.push(endCommit.sha);
      branchMap[endCommit.sha] = endCommit.branches;
      map[endCommit.sha] = counter++;
    }
    if (innerCommits.length > 0) {
      nodes.push(innerCommits[0].sha);
      branchMap[innerCommits[0].sha] = innerCommits[0].branches;
      map[innerCommits[0].sha] = counter++;
    }
  });
 //add link stats to branches with inner nodes
 filteredCommitGroups.forEach(commitGroup => {
    const { startCommit, innerCommits, endCommit } = commitGroup;
    if (innerCommits.length > 0) {
      const { stats } = innerCommits.reduce((sum, currentCommit) => {
        sum.stats.additions += currentCommit.stats.additions;
        sum.stats.deletions += currentCommit.stats.deletions;
        return sum;
      });
      const additions = scaleStats(stats.additions);
      const deletions = scaleStats(stats.deletions);

      links.push({
        source: startCommit.sha,
        target: innerCommits[0].sha,
        value: additions + deletions
      });
      links.push({
        source: innerCommits[0].sha,
        target: endCommit.sha,
        value: additions,
        type: "addition"
      });
      links.push({
        source: innerCommits[0].sha,
        target: endCommit.sha,
        value: deletions,
        type: "deletion"
      });
    }
  });
  // add stats for single commits
  filteredCommitGroups.forEach(commitGroup => {
    const { startCommit, innerCommits, endCommit } = commitGroup;
    if (innerCommits.length <= 0) {
      links.push({
        source: startCommit.sha,
        target: endCommit.sha,
        value: scaleStats(endCommit.stats.additions),
        type: "addition"
      });
      links.push({
        source: startCommit.sha,
        target: endCommit.sha,
        value: scaleStats(endCommit.stats.additions),
        type: "deletion"
      });
    }
  });
  return {
      links: links.map(link => {
        return {
          source: map[link.source],
          target: map[link.target],
          value: link.value,
          type: link.type
        };
      }),
      nodes: nodes.map(node => {
        let branchName = branchMap[node];
        if(branchName && branchName[0]){
          branchName = branchName[0].name;
        }else{
          branchName = node.substring(0,5);
        }
        return { id: map[node], name: branchName };
      })
  };
}


// scale link width logarithmically
function scaleStats(stats) {
    return Math.max(Math.log(stats), 1);
  }
  
//Removes commitgroups where an alternative route with innercommits exists with same start and end.
function filterOutForcedFFMerges(commitGroups) {
    return commitGroups.filter((commitGroup, index, array) => {
      if (commitGroup.innerCommits.length > 0) {
        return true;
      }
      let otherIndex = array.findIndex(
        (otherCommitGroup, otherIndex) =>
          commitGroup.startCommit.sha === otherCommitGroup.startCommit.sha &&
          commitGroup.endCommit.sha === otherCommitGroup.endCommit.sha &&
          index !== otherIndex
      );
      return otherIndex === -1;
    });
}