import { gql } from "apollo-server";

//TODO - DON'T ALLOW CLIENT TO BE ABLE TO QUERY PASSWORD
const examType = gql`
  scalar Date

  type Exam {
    id: ID!
    subject: String!
    examDate: Date!
    startDate: Date
    totalNumberDays: Int!
    numberPages: Int!
    lastPage: Int!
    timePerPage: Int!
    timesRepeat: Int!
    startPage: Int!
    currentPage: Int!
    notes: String
    studyMaterialLinks: [String]
    color: String
    textColor: String
    completed: Boolean
    userId: ID!
  }

  # duration in minutes
  type TodaysChunk {
    exam: Exam!
    numberPagesToday: Int!
    startPage: Int!
    durationToday: Int!
    durationLeftToday: Int!
    daysLeft: Int! #incl. today
    completed: Boolean!
  }

  type TodaysChunkAndProgress {
    todaysChunks: [TodaysChunk]!
    todaysProgress: Int!
  }

  type CalendarChunkDetails {
    examDate: Date!
    currentPage: Int!
    numberPagesLeftTotal: Int!
    numberPagesPerDay: Int!
    durationTotal: Int!
    durationPerDay: Int!
    studyMaterialLinks: [String]
  }

  type CalendarChunk {
    title: String!
    start: Date!
    end: Date!
    color: String!
    textColor: String!
    extendedProps: CalendarChunkDetails!
  }

  type CalendarExam {
    title: String!
    start: Date!
    end: Date!
    color: String!
  }

  type CalendarObject {
    calendarChunks: [CalendarChunk]!
    calendarExams: [CalendarExam]!
  }

  type ExamsCount {
    currentExams: Int!
    finishedExams: Int!
  }
`;

module.exports = { examType };
