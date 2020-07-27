import { gql } from "apollo-server";

const userType = gql`
  type User {
    id: ID!
    googleId: String
    username: String!
    email: String!
    mascot: Int!
    googleLogin: Boolean!
    allowEmailNotifications: Boolean!
  }

  type UpdateUserResponse {
    successful: Boolean!
    user: User!
  }
`;

module.exports = { userType };
