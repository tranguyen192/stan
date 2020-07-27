import { gql } from "apollo-boost"; //to make queries

//-----------------USER QUERIES-----------------
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
`;

//-----------------EXAM QUERIES-----------------
export const GET_EXAMS_QUERY = gql`
  {
    exams {
      id
      subject
      examDate
      startDate
      numberPages
      lastPage
      timePerPage
      timesRepeat
      currentPage
      startPage
      notes
      studyMaterialLinks
      completed
    }
  }
`;

export const GET_EXAM_QUERY = gql`
  query($id: ID!) {
    exam(id: $id) {
      id
      subject
      examDate
      startDate
      numberPages
      lastPage
      timePerPage
      timesRepeat
      currentPage
      startPage
      notes
      studyMaterialLinks
      completed
    }
  }
`;

export const GET_TODAYS_CHUNKS_AND_PROGRESS = gql`
  query {
    todaysChunkAndProgress {
      todaysChunks {
        exam {
          id
          subject
          examDate
          startDate
          totalNumberDays
          numberPages
          lastPage
          timesRepeat
          timePerPage
          currentPage
          studyMaterialLinks
          notes
        }
        numberPagesToday
        startPage
        durationToday
        durationLeftToday
        daysLeft
        completed
      }
      todaysProgress
    }
  }
`;

export const GET_CALENDAR_CHUNKS = gql`
  query {
    calendarChunks {
      calendarChunks {
        title
        start
        end
        color
        extendedProps {
          examDate
          currentPage
          numberPagesLeftTotal
          numberPagesPerDay
          durationTotal
          durationPerDay
          studyMaterialLinks
        }
      }
      calendarExams {
        title
        start
        end
        color
      }
    }
  }
`;

export const GET_EXAMS_COUNT = gql`
  query {
    examsCount {
      currentExams
      finishedExams
    }
  }
`;
