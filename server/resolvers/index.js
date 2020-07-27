import { userResolvers } from "./userResolvers";
import { examResolvers } from "./examResolvers";

const resolvers = [userResolvers, examResolvers];

module.exports = {
  resolvers
};
