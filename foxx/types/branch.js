'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'Branch',
  description: 'A git branch',
  fields() {
    return {
      name: {
        type: gql.GraphQLString,
        resolve: e => e.name
      }
    };
  }
});
