function calcGoalPage(numberPagesToday, chunkStartPage, startPage, lastPage) {
  let goalPage = numberPagesToday + chunkStartPage - 1

  if (goalPage > lastPage) {
    //gone over rep cycle

    //e.g. 5 % 5 = 0, but: 4%5 = 4 + 1 = 5
    let leftover = ((goalPage - 1) % lastPage) + 1

    goalPage = leftover + startPage - 1
    // if (goalPage === 0) goalPage = lastPage
  }
  return goalPage
}
// function calcGoalPage(numberPagesToday, chunkStartPage, startPage, lastPage) {
//   let goalPage = numberPagesToday + chunkStartPage - 1

//   if (goalPage > lastPage) {
//     console.log("here")
//     //gone over rep cycle
//     let leftover = goalPage % lastPage
//     console.log(leftover)
//     goalPage = leftover + startPage - 1
//     if (goalPage === 0) goalPage = lastPage
//   }
//   return goalPage
// }

test("verifies datesTimingIsValid", () => {
  expect(calcGoalPage(51, 50, 51, 100)).toBe(100)
  expect(calcGoalPage(1, 1, 1, 1)).toBe(1)
  expect(calcGoalPage(1, 5, 5, 5)).toBe(5)
  expect(calcGoalPage(5, 5, 5, 9)).toBe(9)

  expect(calcGoalPage(100, 51, 51, 100)).toBe(100)
  expect(calcGoalPage(100, 51, 1, 100)).toBe(50)
  expect(calcGoalPage(100, 51, 1, 100)).toBe(50)
  expect(calcGoalPage(6, 5, 5, 10)).toBe(10)
  expect(calcGoalPage(10, 1, 1, 5)).toBe(5)
})
