import { learningIsComplete } from "./examHelpers";

export function calculateChunkProgress(chunks) {
  if (chunks.length <= 0) return 100;
  let totalDuration = 0;
  let totalDurationCompleted = 0;
  chunks.forEach(chunk => {
    totalDuration += chunk.durationToday;
    totalDurationCompleted += durationCompleted({
      duration: chunk.durationToday,
      startPage: chunk.startPage,
      currentPage: chunk.currentPage,
      numberPages: chunk.numberPagesToday,
      completed: chunk.completed
    });
  });
  //duration ..... 100%
  //duration completed ... x
  if (totalDuration === 0) return 0;
  let progress = Math.floor((100 / totalDuration) * totalDurationCompleted);
  if (progress < 0) progress = 0;
  return progress;
}

export function durationCompleted({ duration, startPage, currentPage, numberPages, completed }) {
  if (completed || learningIsComplete(currentPage, startPage, numberPages, 1)) return duration;
  const timePerPage = duration / numberPages;
  const numberOfPagesCompleted = currentPage - startPage;
  return numberOfPagesCompleted * timePerPage;
}
