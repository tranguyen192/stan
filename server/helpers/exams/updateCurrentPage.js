import { Exam, TodaysChunkCache } from "../../models";
import { learningIsComplete } from "./examHelpers";
import { todaysChunkIsCompleted } from "./chunkHelpers";
import { UserInputError } from "apollo-server";

export async function handleUpdateCurrentPage(args, userInfo) {
  const exam = await handleCurrentPageInput(args.page, args.id, userInfo.userId);
  if (exam.currentPage === args.page) return true;

  const resp = await Exam.updateOne(
    { _id: args.id, userId: userInfo.userId },
    {
      currentPage: args.page,
      updatedAt: new Date()
    }
  );
  if (resp.ok !== 1 || resp.nModified !== 1)
    throw new Error("The current page couldn't be updated.");
  await handleUpdateCurrentPageInTodaysChunkCache(userInfo.userId, exam._id, args.page);
}

export async function handleCurrentPageInput(page, examId, userId) {
  const exam = await Exam.findOne({
    _id: examId,
    userId: userId
  });
  if (!exam) throw new Error("There is no exam with the id: " + examId + " for that user.");
  if (page < exam.startPage)
    throw new UserInputError(
      "The entered current page is lower than the start page for this exam."
    );
  if (page > exam.numberPages * exam.timesRepeat + exam.startPage)
    throw new UserInputError(
      "The entered current page is higher than the number of pages for this exam."
    );
  exam.completed = learningIsComplete(page, exam.startPage, exam.numberPages, exam.timesRepeat);
  return exam;
}

export async function handleUpdateCurrentPageInTodaysChunkCache(userId, examId, page) {
  const todaysChunkCache = await TodaysChunkCache.findOne({
    examId: examId,
    userId
  });
  if (!todaysChunkCache) return;
  let completed = todaysChunkIsCompleted(page, todaysChunkCache);
  const updateCacheResp = await TodaysChunkCache.updateOne(
    { examId: examId, userId },
    {
      currentPage: page,
      completed,
      updatedAt: new Date()
    }
  );
  if (updateCacheResp.ok !== 1 || updateCacheResp.nModified !== 1)
    throw new Error("The todays chunk cache current page could not be updated.");
}
