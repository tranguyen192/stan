import { Exam } from "../../models";
import { deleteExamsTodaysCache } from "./chunkHelpers";
import { fetchExam } from "./examHelpers";

export async function handleExamCompleted(args, userInfo) {
  await fetchExam(args.id, userInfo.userId);
  const resp = await Exam.updateOne(
    { _id: args.id, userId: userInfo.userId },
    { completed: args.completed, updatedAt: new Date() }
  );

  if (resp.ok === 1 && resp.nModified === 0) return true;
  if (resp.ok === 0) throw new Error("The exam couldn't be updated.");

  await deleteExamsTodaysCache(userInfo.userId, args.id);
}
