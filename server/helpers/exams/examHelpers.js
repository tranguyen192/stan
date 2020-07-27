import { verifyExamInput, verifyUpdateExamDates } from "./validateExamInput";
import { UserInputError } from "apollo-server";
import { Exam } from "../../models";
import { escapeStringForHtml } from "../generalHelpers";
import { getBackgroundColor, generateTextColor } from "./colors";
import { getNumberOfDays } from "../dates";

export async function fetchExam(examId, userId) {
  const exam = await Exam.findOne({
    _id: examId,
    userId
  });
  if (!exam) throw new Error("This exam does not exist.");
  return exam;
}

export async function fetchUncompletedExams(userId) {
  return await Exam.find({
    userId: userId,
    completed: false
  }).sort({ examDate: "asc" });
}

export function prepareExamInputData(args, userId) {
  args.examDate = new Date(args.examDate);
  if (!args.startDate || args.startDate.length <= 0) {
    args.startDate = new Date();
  }
  args.startPage = args.startPage || 1;
  args.numberPages = calcNumberPagesFromPageNumbers(args.startPage, args.lastPage);
  args.timesRepeat = args.timesRepeat || 1;
  args.currentPage = args.currentPage || args.startPage;
  args.completed = args.completed || false;
  args.userId = userId;
  args.color = getBackgroundColor(args.color, args);
  args.textColor = generateTextColor(args.color);
  args.totalNumberDays = getNumberOfDays(args.startDate, args.examDate);
  args.updatedAt = new Date();
  return { ...args };
}

export function calcNumberPagesFromPageNumbers(startPage, lastPage) {
  if (lastPage < startPage)
    throw new UserInputError("The last page should be higher than the start page.");
  return lastPage - startPage + 1;
}

export async function handleUpdateExamInput(exam, args, userId) {
  verifyExamInput(args, userId);
  verifyUpdateExamDates(args.startDate, args.examDate, exam.startDate);
  args.numberPages = calcNumberPagesFromPageNumbers(args.startPage, args.lastPage);
  args.color = getBackgroundColor(args.color, args);
  args.textColor = generateTextColor(args.color);
  return prepareExamInputData({ ...args }, userId);
}

export function learningIsComplete(currentPage, startPage, numberPages, repeat = 1) {
  const endPage = startPage + numberPages * repeat - 1;
  return currentPage > endPage;
}

export function escapeExamObject(exam) {
  exam.subject = escapeStringForHtml(exam.subject);
  exam.notes = escapeStringForHtml(exam.notes);
  return exam;
}

export function escapeExamObjects(exams) {
  const escapedExams = [];
  exams.forEach(exam => {
    escapedExams.push(escapeExamObject(exam));
  });
  return escapedExams;
}

export function escapeTodaysChunksObjects(chunks) {
  chunks.forEach(chunk => {
    chunk.exam = escapeExamObject(chunk.exam);
  });
  return chunks;
}

export function escapeCalendarObjects(calendarObjects) {
  calendarObjects.forEach(calendarObject => {
    calendarObject.title = escapeStringForHtml(calendarObject.title);
  });
  return calendarObjects;
}
