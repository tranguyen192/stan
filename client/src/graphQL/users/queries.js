import { gql } from "apollo-boost"

export const CURRENT_USER = gql`
  query {
    currentUser {
      id
      username
      email
      mascot
      googleLogin
      allowEmailNotifications
    }
  }
`
