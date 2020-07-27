import { numberOfPagesForChunk } from "../../helpers/exams/chunkHelpers";
import { chunkCacheIsValid } from "../../helpers/exams/todaysChunks";

import { durationCompleted } from "../../helpers/exams/todaysChunkProgress";

test("the number of pages for each chunk is correct", () => {
  expect(
    numberOfPagesForChunk({
      numberOfPages: 50,
      startPage: 1,
      currentPage: 10,
      daysLeft: 5,
      repeat: 2
    })
  ).toBe(19);

  expect(
    numberOfPagesForChunk({
      numberOfPages: 30,
      startPage: 10,
      currentPage: 39,
      daysLeft: 100,
      repeat: 1
    })
  ).toBe(1);

  expect(
    numberOfPagesForChunk({
      numberOfPages: 30,
      startPage: 1,
      currentPage: 30,
      daysLeft: 1,
      repeat: 2
    })
  ).toBe(31);
});

test("the if chunk cache is valid", () => {
  expect(chunkCacheIsValid(new Date(), "2011-03-04")).toBeTruthy();
  expect(chunkCacheIsValid("1999-03-04", "2011-03-04")).toBeFalsy();
  expect(chunkCacheIsValid("2012-03-04", "2011-03-04")).toBeFalsy();
});

test("that correct Error is thrown with NaN inputs", () => {
  try {
    numberOfPagesForChunk({
      numberOfPages: "Test",
      startPage: 1,
      currentPage: 30,
      daysLeft: 1,
      repeat: 1
    });
    throw new Error("Error wasn't thrown");
  } catch (err) {
    expect(err.message).toBe("Not all arguments for numberOfPagesForChunk are numbers.");
  }

  try {
    numberOfPagesForChunk({
      numberOfPages: 30,
      startPage: "Test",
      currentPage: 1,
      daysLeft: 1,
      repeat: 1
    });
    throw new Error("Error wasn't thrown");
  } catch (err) {
    expect(err.message).toBe("Not all arguments for numberOfPagesForChunk are numbers.");
  }

  try {
    numberOfPagesForChunk({
      numberOfPages: 30,
      startPage: 1,
      currentPage: "Test",
      daysLeft: 1,
      repeat: 1
    });
    throw new Error("Error wasn't thrown");
  } catch (err) {
    expect(err.message).toBe("Not all arguments for numberOfPagesForChunk are numbers.");
  }

  try {
    numberOfPagesForChunk({
      numberOfPages: 50,
      startPage: 1,
      currentPage: 30,
      daysLeft: "Test",
      repeat: 1
    });
    throw new Error("Error wasn't thrown");
  } catch (err) {
    expect(err.message).toBe("Not all arguments for numberOfPagesForChunk are numbers.");
  }

  try {
    numberOfPagesForChunk({
      numberOfPages: 50,
      startPage: 1,
      currentPage: 30,
      daysLeft: 1,
      repeat: "Test"
    });
    throw new Error("Error wasn't thrown");
  } catch (err) {
    expect(err.message).toBe("Not all arguments for numberOfPagesForChunk are numbers.");
  }
});

test("the duration completed is correct", () => {
  //can use "nice/dividable" numbers since when creating today's chunks the page number is rounded before multiplied with timePerPage (both ints, not floats)
  expect(
    durationCompleted({
      duration: 450,
      startPage: 5,
      currentPage: 10,
      numberPages: 15
    })
  ).toBe(150);

  expect(
    durationCompleted({
      duration: 50,
      startPage: 1,
      currentPage: 5,
      numberPages: 10
    })
  ).toBe(20);

  expect(
    durationCompleted({
      duration: 6,
      startPage: 1,
      currentPage: 2,
      numberPages: 3
    })
  ).toBe(2);

  expect(
    durationCompleted({
      duration: 400,
      startPage: 1,
      currentPage: 1,
      numberPages: 200
    })
  ).toBe(0);

  //current page means, this page still needs to be learned -> therefore 201 means page 200 is completed
  expect(
    durationCompleted({
      duration: 400,
      startPage: 1,
      currentPage: 201,
      numberPages: 200
    })
  ).toBe(400);
});
