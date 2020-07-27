import { Exam } from "../../models";
import { verifyExamInput, verifyAddExamDates } from "./validateExamInput";
import { prepareExamInputData } from "./examHelpers";

export async function handleAddExam(args, userInfo) {
  verifyExamInput(args, userInfo.userId);
  verifyAddExamDates(args.startDate, args.examDate);
  const processedArgs = prepareExamInputData({ ...args }, userInfo.userId);
  const resp = await Exam.create(processedArgs);
  if (!resp) throw new Error("Exam could not be saved to the database.");
}
