'use strict';
const Promise = require('bluebird');
const Model = require('./Model.js');
const Commit = require('./Commit.js');
const aql = require('arangojs').aql;

const Branch = Model.define('Branch', {
  attributes: ['name']
});

Branch.persist = function(branchReference, urlProvider = null) {
  const name = branchReference.shorthand().replace(/^origin\//,"");
  const target = branchReference.target();
  Branch.findOneByName(name).then(instance => {
    if(instance){
      return instance;
    }
    return Branch.create({
      name
    }).tap(function(branch) {
        return Commit.findById(target).then(function(commit) {
            if (commit) {
              commit.childCommits().then(children => {
                if(children.length == 0){
                  commit.connect(branch);
                }
              });
            }
      });
    });
  });
};

Branch.propageMergeCommits = function(){
  const anchestorRule = function(commitSha, branchName) {
    return Commit.findById(commitSha).then(commit => {
      if(!commit){
        return;
      }
      return Branch.findOneByName(branchName).then(branch => {
        if(!branch){
          return;
        }
        return commit.getAllLinearParents().then(linearParents => {
          return Promise.map(linearParents, sha=> {
            return Commit.findById(sha).then(c => c.connect(branch));
          });
        });
      });
    });
  }
  return Commit.getAllMergeCommits().then(mergeCommits => {
    return Promise.map(mergeCommits, mergeCommit => {
      const originNames = Branch.getOriginNamesFromMessage(mergeCommit.commit.message);
      if(originNames){
        return connectShaToBranchName(mergeCommit.commit.sha, originNames[0]).then(()=> {
          return Promise.map(mergeCommit.parents, (parent) => {
            const parentSha = parent.sha;
            const branchName = originNames[parent.index];
            return connectShaToBranchName(parentSha, branchName).then(() => {
              return anchestorRule(parentSha, branchName);
            });
          });
        });
      }
    })
  });
}

Branch.applyMajorityRule = function(){
  const CommitCommitConnection = require('./CommitCommitConnection.js');
  const CommitBranchConnection = require('./CommitBranchConnection.js');
  return Promise.resolve(
    Branch.rawDb.query(
      aql`let specialCommits = (
            FOR c IN ${Commit.collection}
              let parentCommitCount = COUNT(FOR other IN 1..1 INBOUND c ${CommitCommitConnection.collection} RETURN other)
              let childrenCommitCount = COUNT(FOR other IN 1..1 OUTBOUND c ${CommitCommitConnection.collection} RETURN other)
              FILTER (childrenCommitCount != 1) OR (parentCommitCount != 1)
                RETURN c
          )
          FOR commit IN specialCommits
            FOR c, e, p IN 1..1000 INBOUND commit ${CommitCommitConnection.collection}
              PRUNE CONTAINS_ARRAY(specialCommits, c) AND (NOT (c == commit))
              OPTIONS {bfs: true, uniqueEdges : 'path', uniqueVertices : 'path'}
              FILTER CONTAINS_ARRAY(specialCommits, c) AND (NOT (c == commit))
              RETURN (FOR finalCommit IN p.vertices[*]
                let branchName = (FOR branch IN 1..1 INBOUND finalCommit ${CommitBranchConnection.collection} RETURN branch.name)[0]
                RETURN { sha: finalCommit.sha, branch: branchName })
        `
    )
  ).then(cursor => {
    return cursor.all().then(commitGroups => {
      return Promise.map(commitGroups,commitGroup => {
        const branchNameCounter = {};
        commitGroup.forEach(commit => {
          const currentCounter = branchNameCounter[commit.branch];
          if(currentCounter){
            branchNameCounter[commit.branch]++;
          }else{
            branchNameCounter[commit.branch] = 1;
          }
        });
        let singleMax;
        let maximum = 0;
        let majority;
        for(let branchName in branchNameCounter){
          if(branchName == 'null'){
            continue;
          }
          if(branchNameCounter[branchName] == maximum){
            singleMax = false;
            continue;
          }
          if(branchNameCounter[branchName] > maximum){
            maximum = branchNameCounter[branchName];
            majority = branchName;
            singleMax = true;
          }
        }
    
        if(singleMax === true){
          commitGroup.pop(); //Remove starting point commit. The starting point commit should not be assined 
          return Promise.map(commitGroup, commit => {
            if(commit.branch == null && majority){
              return connectShaToBranchName(commit.sha, majority);
            }
          });
        }
      });
    });
  });
};

Branch.getOriginNamesFromMessage = function(message) {
  const branchMergeRegex = /Merge (?<mergeType>remote |remote-tracking )?branch(es)? '?(?<fromBranch>[a-zA-Z0-9/\-\.]*)'?(?<otherFromBranches>( and '?[a-zA-Z0-9/\-\.]*'?)*)(( into '?(?<toBranch>[a-zA-Z0-9/\-\.]*)'?)|(?<toMasterMerge>\n))/;
  const match = message.match(branchMergeRegex);
  const pullRequestMergeRegex = /Merge pull request #(?<PRId>[0-9]+) from '?(?<fromBranch>[a-zA-Z0-9/\-\.]*)'?( into '?(?<toBranch>[a-zA-Z0-9/\-\.]*)'?)?/
  if(match){
    let destination = match.groups.toBranch;
    if(match.groups.toMasterMerge){
      destination = 'master';
    }
    const branches = [destination, match.groups.fromBranch];
    const otherFromBranches = match.groups.otherFromBranches;
    if(otherFromBranches){
      const additionalBranches = otherFromBranches.replace(/'/g,'').split(' and ');
      additionalBranches.shift();
      return branches.concat(additionalBranches);
    }
    return branches;
  }
  return undefined;
}

const connectShaToBranchName = function(commitSha, branchName){
  return Commit.findById(commitSha).then(commit => {
    return Branch.findOneByName(branchName).then(branch => {
      if(!branch){
        return Branch.create({
          name: branchName
        }).then(createdBranch => {
          return commit.connect(createdBranch);
        }).catch(()=>{
          return Branch.findOneByName(branchName).then(existingBranch => {
            return commit.connect(existingBranch);
          });
        });
      }else{
        return commit.connect(branch);
      }
    });
  });
}

module.exports = Branch;
