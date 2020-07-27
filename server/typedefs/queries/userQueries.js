import { gql } from "apollo-server";
//  TODO: CHECK WHAT IS REQUIRED AND WHAT ISN't
const userQueries = gql`
  type Query {
    currentUser: User
  }

  type Mutation {
    signup(
      username: String!
      email: String!
      password: String
      mascot: Int
      allowEmailNotifications: Boolean!
    ): String!
    logout: Boolean
    login(email: String!, password: String): String!
    googleLogin(idToken: String!): String!
    forgottenPasswordEmail(email: String!): Boolean!
    resetPassword(userId: String!, token: String!, newPassword: String!): Boolean!
    updateUser(
      username: String!
      email: String!
      password: String
      newPassword: String
      mascot: Int!
      allowEmailNotifications: Boolean!
    ): User!

    updateMascot(mascot: Int!): Boolean
    deleteUser: Boolean
  }
`;

module.exports = { userQueries };
