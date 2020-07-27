import { gql } from "apollo-server";

const examQueries = gql`
  type Query {
    exams: [Exam]
    exam(id: ID!): Exam
    todaysChunkAndProgress: TodaysChunkAndProgress!
    calendarChunks: CalendarObject!
    examsCount: ExamsCount!
  }

  type Mutation {
    addExam(
      subject: String!
      examDate: Date!
      startDate: Date!
      lastPage: Int!
      timePerPage: Int!
      timesRepeat: Int
      startPage: Int!
      color: String
      notes: String
      studyMaterialLinks: [String]
      completed: Boolean
    ): Boolean

    updateExam(
      id: ID!
      subject: String!
      examDate: Date!
      startDate: Date!
      lastPage: Int!
      timePerPage: Int!
      timesRepeat: Int!
      startPage: Int!
      currentPage: Int!
      color: String
      notes: String
      studyMaterialLinks: [String]
    ): Exam!

    updateCurrentPage(id: ID!, page: Int!): Boolean
    deleteExam(id: ID!): Boolean
    examCompleted(id: ID!, completed: Boolean!): Boolean
  }
`;

module.exports = { examQueries };
