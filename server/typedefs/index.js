import { types } from "./types";
import { queries } from "./queries";
import { gql } from "apollo-server";
import { mergeTypes } from "merge-graphql-schemas";

const typeDefs = gql`
  ${mergeTypes([...types, ...queries])}
`;

module.exports = {
  typeDefs
};
