'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'commitGroup',
  description: 'groups linear commits. Probably branches',
  fields() {
    return {
      startCommit: {
        type: require('./commit.js'),
      },
      endCommit: {
        type: require('./commit.js'),
      },
      innerCommits: {
        type: new gql.GraphQLList(require('./commit.js')),
      },
    };
  }
});
