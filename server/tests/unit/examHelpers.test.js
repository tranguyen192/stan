import { learningIsComplete } from "../../helpers/exams/examHelpers";

test("that the float is rounded to two decimals correctly", () => {
  expect(learningIsComplete(101, 1, 100)).toBeTruthy();
  expect(learningIsComplete(201, 1, 100, 2)).toBeTruthy();
  expect(learningIsComplete(50, 20, 100)).toBeFalsy();
});
