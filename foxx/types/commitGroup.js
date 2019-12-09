'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const db = arangodb.db;
const aql = arangodb.aql;

module.exports = new gql.GraphQLObjectType({
  name: 'commitGroup',
  description: 'groups linear commits. Propably branches',
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
