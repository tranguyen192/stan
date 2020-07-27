import { Exam } from "../../models";
import { fetchExam } from "./examHelpers";
import { deleteExamsTodaysCache } from "./chunkHelpers";

export async function handleDeleteExam(args, userInfo) {
  await fetchExam(args.id, userInfo.userId);
  const resp = await Exam.deleteOne({
    _id: args.id,
    userId: userInfo.userId
  });
  if (resp.ok !== 1) throw new Error("There was a problem when deleting the exam");
  await deleteExamsTodaysCache(userInfo.userId, args.id);
}
