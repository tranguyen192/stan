export const calcExamProgress = (exam) => {
  /**
   * nr pages * repeat....100%
   * currentPage - startPage (as if startpage = 0)...x
   */
  const currentPageWithoutStartpage = exam.currentPage - exam.startPage
  const totalNumberPages = exam.numberPages * exam.timesRepeat
  if (totalNumberPages === 0) return 0 //to avoid division by 0 which would return infinity
  const examProgress = Math.floor(
    (100 * currentPageWithoutStartpage) / totalNumberPages
  )
  return examProgress
}

export const currentRepetition = (examDetails) => {
  let rep = Math.floor(
    (examDetails.currentPage - examDetails.startPage) /
      examDetails.numberPages +
      1
  )

  if (rep < 1) rep = 1
  if (rep > examDetails.timesRepeat) return examDetails.timesRepeat

  return rep
}

export const calcProgressbar = (examDetails) => {
  let progressbar = Math.floor(
    (100 * (examDetails.currentPage - examDetails.startPage)) /
      (examDetails.numberPages * examDetails.timesRepeat)
  )

  if (learningIsComplete(examDetails) || progressbar > 100) progressbar = 100
  return progressbar
}

export const getCurrentPage = (examDetails, currentRep) => {
  if (learningIsComplete(examDetails)) return examDetails.lastPage
  let currentPageWithoutStartPage =
    examDetails.currentPage - examDetails.startPage
  let numberPagesLearned = examDetails.numberPages * (currentRep - 1)

  return (
    currentPageWithoutStartPage - numberPagesLearned + examDetails.startPage
  )
}
export const learningIsComplete = ({
  currentPage,
  startPage,
  numberPages,
  timesRepeat = 1,
}) => {
  const endPage = startPage + numberPages * timesRepeat - 1
  return currentPage > endPage
}

export const pagesLeft = (examDetails) => {
  const pagesLeft =
    examDetails.numberPages * examDetails.timesRepeat -
    (examDetails.currentPage - examDetails.startPage)
  return pagesLeft
}
