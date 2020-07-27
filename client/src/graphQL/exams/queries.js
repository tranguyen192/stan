import { gql } from "apollo-boost"

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
      color
      startPage
      notes
      studyMaterialLinks
      completed
    }
  }
`

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
      color
      textColor
      notes
      studyMaterialLinks
      completed
    }
  }
`

export const GET_TODAYS_CHUNKS_AND_PROGRESS = gql`
  query {
    todaysChunkAndProgress {
      todaysChunks {
        exam {
          id
          subject
          examDate
          startDate
          startPage
          totalNumberDays
          numberPages
          lastPage
          timesRepeat
          timePerPage
          currentPage
          studyMaterialLinks
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
`

export const GET_CALENDAR_CHUNKS = gql`
  query {
    calendarChunks {
      calendarChunks {
        title
        start
        end
        color
        textColor
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
`

export const GET_TODAYS_CHUNKS_PROGRESS = gql`
  query {
    todaysChunksProgress
  }
`

export const GET_EXAMS_COUNT = gql`
  query {
    examsCount {
      currentExams
      finishedExams
    }
  }
`
