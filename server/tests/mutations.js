import { gql } from "apollo-boost"; //to make queries

//-----------------USER QUERIES-----------------
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
`;
export const LOGIN_MUTATION = gql`
  mutation($email: String!, $password: String) {
    login(email: $email, password: $password)
  }
`;

export const GOOGLE_LOGIN_MUTATION = gql`
  mutation($idToken: String!) {
    googleLogin(idToken: $idToken)
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation {
    logout
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation($userId: String!, $token: String!, $newPassword: String!) {
    resetPassword(userId: $userId, token: $token, newPassword: $newPassword)
  }
`;

export const FORGOTTEN_PASSWORD_EMAIL = gql`
  mutation($email: String!) {
    forgottenPasswordEmail(email: $email)
  }
`;

export const UPDATE_MASCOT_MUTATION = gql`
  mutation($mascot: Int!) {
    updateMascot(mascot: $mascot)
  }
`;

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
`;

export const DELETE_USER_MUTATION = gql`
  mutation {
    deleteUser
  }
`;

//-----------------EXAM QUERIES-----------------
export const ADD_EXAM_MUTATION = gql`
  mutation(
    $subject: String!
    $examDate: Date!
    $startDate: Date!
    $lastPage: Int!
    $timePerPage: Int!
    $timesRepeat: Int
    $startPage: Int!
    $color: String
    $notes: String
    $studyMaterialLinks: [String]
    $completed: Boolean
  ) {
    addExam(
      subject: $subject
      examDate: $examDate
      startDate: $startDate
      lastPage: $lastPage
      timePerPage: $timePerPage
      timesRepeat: $timesRepeat
      startPage: $startPage
      color: $color
      notes: $notes
      studyMaterialLinks: $studyMaterialLinks
      completed: $completed
    )
  }
`;

export const UPDATE_EXAM_MUTATION = gql`
  mutation(
    $id: ID!
    $subject: String!
    $examDate: Date!
    $startDate: Date!
    $lastPage: Int!
    $timePerPage: Int!
    $timesRepeat: Int!
    $startPage: Int!
    $currentPage: Int!
    $color: String
    $notes: String
    $studyMaterialLinks: [String] # $completed: Boolean
  ) {
    updateExam(
      id: $id
      subject: $subject
      examDate: $examDate
      startDate: $startDate
      lastPage: $lastPage
      timePerPage: $timePerPage
      timesRepeat: $timesRepeat
      startPage: $startPage
      currentPage: $currentPage
      color: $color
      notes: $notes
      studyMaterialLinks: $studyMaterialLinks # completed: $completed
    ) {
      id
      subject
      examDate
      startDate
      numberPages
      currentPage
      lastPage
      timePerPage
      timesRepeat
      startPage
      notes
      studyMaterialLinks
      completed
    }
  }
`;

export const DELETE_EXAM_MUTATION = gql`
  mutation($id: ID!) {
    deleteExam(id: $id)
  }
`;

export const UPDATE_CURRENT_PAGE_MUTATION = gql`
  mutation($id: ID!, $page: Int!) {
    updateCurrentPage(id: $id, page: $page)
  }
`;

export const EXAM_COMPLETED_MUTATION = gql`
  mutation($id: ID!, $completed: Boolean!) {
    examCompleted(id: $id, completed: $completed)
  }
`;
