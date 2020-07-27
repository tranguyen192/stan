import { TodaysChunkCache } from "../../models";
import { learningIsComplete } from "./examHelpers";

export function numberOfPagesForChunk({ numberOfPages, startPage, currentPage, daysLeft, repeat }) {
  if (
    isNaN(numberOfPages) ||
    isNaN(startPage) ||
    isNaN(currentPage) ||
    isNaN(daysLeft) ||
    isNaN(repeat)
  )
    throw new Error("Not all arguments for numberOfPagesForChunk are numbers.");
  if (daysLeft === 0) return 0;
  const pagesLeft = calcPagesLeft(numberOfPages, repeat, startPage, currentPage);
  return Math.ceil(pagesLeft / daysLeft);
}

export function calcPagesLeft(numberOfPages, repeat, startPage, currentPage) {
  const endPageInclRepeat = numberOfPages * repeat + startPage;
  const pagesLeft = endPageInclRepeat - currentPage;
  if (pagesLeft <= 0) return 0;
  return pagesLeft;
}

export function durationLeft(startPage, currentPage, numberOfPages, timePerPage) {
  const numberPagesLeft = calcPagesLeft(numberOfPages, 1, startPage, currentPage);
  return numberPagesLeft * timePerPage;
}

export function todaysChunkIsCompleted(currentPage, todaysChunkCache) {
  let completed = todaysChunkCache.completed;
  if (
    learningIsComplete(
      currentPage,
      todaysChunkCache.startPage,
      todaysChunkCache.numberPagesToday,
      1
    )
  )
    completed = true;
  return completed;
}

export async function deleteExamsTodaysCache(userId, examId) {
  const todaysChunkCache = await TodaysChunkCache.countDocuments({
    examId,
    userId
  });
  if (todaysChunkCache <= 0) return;
  const respDeleteChunkCache = await TodaysChunkCache.deleteOne({
    examId,
    userId
  });
  if (respDeleteChunkCache.ok !== 1 || respDeleteChunkCache.deletedCount !== 1)
    throw new Error("The exam today's chunk cache couldn't be deleted");
}
