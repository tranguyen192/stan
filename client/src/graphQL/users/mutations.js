import { gql } from "apollo-boost"

export const LOGIN_MUTATION = gql`
  mutation($email: String!, $password: String) {
    login(email: $email, password: $password)
  }
`

export const LOGOUT_MUTATION = gql`
  mutation {
    logout
  }
`

export const SIGNUP_MUTATION = gql`
  mutation(
    $username: String!
    $email: String!
    $password: String
    $mascot: Int
    $allowEmailNotifications: Boolean!
  ) {
    signup(
      username: $username
      email: $email
      password: $password
      mascot: $mascot
      allowEmailNotifications: $allowEmailNotifications
    )
  }
`

export const GOOGLE_LOGIN_MUTATION = gql`
  mutation($idToken: String!) {
    googleLogin(idToken: $idToken)
  }
`

export const UPDATE_USER_MUTATION = gql`
  mutation(
    $username: String!
    $email: String!
    $password: String
    $newPassword: String
    $mascot: Int!
    $allowEmailNotifications: Boolean!
  ) {
    updateUser(
      username: $username
      email: $email
      password: $password
      newPassword: $newPassword
      mascot: $mascot
      allowEmailNotifications: $allowEmailNotifications
    ) {
      id
      username
      email
      mascot
      googleLogin
      allowEmailNotifications
    }
  }
`

export const DELETE_USER_MUTATION = gql`
  mutation {
    deleteUser
  }
`
export const FORGOTTEN_PASSWORD_EMAIL = gql`
  mutation($email: String!) {
    forgottenPasswordEmail(email: $email)
  }
`

export const RESET_PASSWORD_MUTATION = gql`
  mutation($userId: String!, $token: String!, $newPassword: String!) {
    resetPassword(userId: $userId, token: $token, newPassword: $newPassword)
  }
`

export const UPDATE_MASCOT_MUTATION = gql`
  mutation($mascot: Int!) {
    updateMascot(mascot: $mascot)
  }
`
