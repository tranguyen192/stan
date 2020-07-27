import { Exam, TodaysChunkCache } from "../../models";
import { handleUpdateExamInput, fetchExam } from "./examHelpers";
import { createTodaysChunkObject } from "./todaysChunks";
import { calcPagesLeft, todaysChunkIsCompleted } from "./chunkHelpers";
import { isTheSameDay } from "../dates";

export async function handleUpdateExam(args, userInfo) {
  const exam = await fetchExam(args.id, userInfo.userId);
  const processedArgs = await handleUpdateExamInput(exam, args, userInfo.userId);
  const resp = await Exam.updateOne(
    { _id: args.id, userId: userInfo.userId },
    { ...processedArgs, updatedAt: new Date() }
  );

  if (resp.ok === 0) throw new Error("The exam couldn't be updated.");
  await handleUpdateExamInTodaysChunkCache(userInfo.userId, exam, processedArgs);
  return fetchExam(args.id, userInfo.userId);
}

async function handleUpdateExamInTodaysChunkCache(userId, exam, newArgs) {
  const todaysChunkCache = await TodaysChunkCache.findOne({
    examId: exam._id.toString(),
    userId
  });
  if (!todaysChunkCache) return;

  if (chunkHasToBeChanged(exam, newArgs)) {
    const updates = createUpdatedChunk(newArgs);
    await updateTodaysChunkCache(exam._id, userId, updates);
  } else {
    const updates = {};
    let updateNeeded = false;
    if (exam.currentPage !== newArgs.currentPage) {
      updates.currentPage = newArgs.currentPage;
      updateNeeded = true;
    }
    if (exam.timePerPage !== newArgs.timePerPage) {
      updates.durationToday = todaysChunkCache.numberPagesToday * newArgs.timePerPage;
      updateNeeded = true;
    }
    updates.completed = todaysChunkIsCompleted(newArgs.currentPage, todaysChunkCache);

    if (updateNeeded) {
      await updateTodaysChunkCache(exam._id, userId, updates);
    }
  }
}

function chunkHasToBeChanged(oldExam, newArgs) {
  return (
    !isTheSameDay(oldExam.examDate, newArgs.examDate) ||
    !isTheSameDay(oldExam.startDate, newArgs.startDate) ||
    oldExam.numberPages !== newArgs.numberPages ||
    oldExam.timesRepeat !== newArgs.timesRepeat ||
    oldExam.startPage !== newArgs.startPage
  );
}

function createUpdatedChunk(newArgs) {
  let updates;
  const newChunk = createTodaysChunkObject(newArgs);
  const totalDurationLeft =
    calcPagesLeft(
      newChunk.exam.numberPages,
      newChunk.exam.timesRepeat,
      newChunk.exam.startPage,
      newChunk.exam.currentPage
    ) * newChunk.exam.timePerPage;

  const dailyDurationWithCompletedDuration = totalDurationLeft / newChunk.daysLeft;
  let durationToday = Math.ceil(dailyDurationWithCompletedDuration);
  if (durationToday < 0) durationToday = 0;
  const numberPagesToday = Math.ceil(durationToday / newChunk.exam.timePerPage);
  durationToday = numberPagesToday * newChunk.exam.timePerPage;

  updates = {
    numberPagesToday,
    durationToday,
    startPage: newChunk.currentPage,
    currentPage: newChunk.currentPage,
    daysLeft: newChunk.daysLeft,
    completed: newChunk.completed
  };
  return updates;
}

async function updateTodaysChunkCache(examId, userId, updates) {
  const updateCacheResp = await TodaysChunkCache.updateOne(
    {
      examId: examId.toString(),
      userId
    },
    {
      ...updates,
      updatedAt: new Date()
    }
  );

  if (updateCacheResp.ok !== 1) throw new Error("The todays chunk cache could not be updated.");
}
