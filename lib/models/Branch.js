'use strict';
const Model = require('./Model.js');
const Commit = require('./Commit.js');

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
  const connectMergeParentToBranchName = function(commitSha, branchName){
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
  const anchestorRule = function(commitSha, branchName) {
    //console.log(commitSha);
    return Commit.findById(commitSha).then(commit => {
      if(!commit){
        return;
      }
      return Branch.findOneByName(branchName).then(branch => {
        if(!branch){
          return;
        }
        commit.getAllLinearParents().then(linearParents => {
          linearParents.forEach( sha=> {
            Commit.findById(sha).then(c => c.connect(branch));
          });
        });
      });
    });
  }
  Commit.getAllMergeCommits().then(mergeCommits => {
    mergeCommits.forEach(mergeCommit => {
      const originNames = Branch.getOriginNamesFromMessage(mergeCommit.commit.message);
      if(originNames){
        connectMergeParentToBranchName(mergeCommit.commit.sha, originNames.destination).then(()=> {
          mergeCommit.parents.forEach((parent) => {
            const parentSha = parent.sha;
            const branchName = parent.index === 0 ? originNames.destination : originNames.parents[parent.index-1];
            connectMergeParentToBranchName(parentSha, branchName).then(() => {
              anchestorRule(parentSha, branchName);
            });
          });
        });
      }
    })
  });



}

Branch.getOriginNamesFromMessage = function(message) {
  const branchMergeRegex = /Merge (?<mergeType>branch|remote branch|remote-tracking branch) '?(?<fromBranch>[a-zA-Z0-9/\-\.]*)'?(( into '?(?<toBranch>[a-zA-Z0-9/\-\.]*)'?)|(?<toMasterMerge>\n))/
  const match = message.match(branchMergeRegex);
  const pullRequestMergeRegex = /Merge pull request #(?<PRId>[0-9]+) from '?(?<fromBranch>[a-zA-Z0-9/\-\.]*)'?( into '?(?<toBranch>[a-zA-Z0-9/\-\.]*)'?)?/
  if(match){
    const parents = [match.groups.fromBranch];
    let destination = match.groups.toBranch;
    if(match.groups.toMasterMerge){
      destination = 'master';
    }
    return {
      parents,
      destination
    }
  }
  return undefined;
}

module.exports = Branch;
