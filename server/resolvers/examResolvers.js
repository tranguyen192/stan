import { Exam } from "../models";
import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";
import { UserInputError } from "apollo-server";
import {
  escapeExamObject,
  escapeExamObjects,
  escapeTodaysChunksObjects,
  escapeCalendarObjects,
  fetchExam
} from "../helpers/exams/examHelpers";
import { fetchTodaysChunks } from "../helpers/exams/todaysChunks";
import { calculateChunkProgress } from "../helpers/exams/todaysChunkProgress";
import { fetchCalendarChunks } from "../helpers/exams/calendarChunks";
import { handleResolverError, handleAuthentication } from "../helpers/generalHelpers";
import { handleAddExam } from "../helpers/exams/addExam";
import { handleUpdateExam } from "../helpers/exams/updateExam";
import { handleUpdateCurrentPage } from "../helpers/exams/updateCurrentPage";
import { handleExamCompleted } from "../helpers/exams/examCompleted";
import { handleDeleteExam } from "../helpers/exams/deleteExam";
import { isDateInvalid } from "../helpers/dates";

export const examResolvers = {
  Query: {
    exams: async (_, __, { userInfo }) => {
      try {
        handleAuthentication(userInfo);
        const exams = await Exam.find({
          userId: userInfo.userId
        }).sort({ subject: "asc" });

        return escapeExamObjects(exams);
      } catch (err) {
        handleResolverError(err);
      }
    },
    exam: async (_, args, { userInfo }) => {
      try {
        handleAuthentication(userInfo);
        const exam = await fetchExam(args.id, userInfo.userId);
        return escapeExamObject(exam);
      } catch (err) {
        handleResolverError(err);
      }
    },
    todaysChunkAndProgress: async (_, __, { userInfo }) => {
      try {
        handleAuthentication(userInfo);
        const chunks = await fetchTodaysChunks(userInfo.userId);
        const todaysProgress = calculateChunkProgress(chunks);
        const escapedChunks = escapeTodaysChunksObjects(chunks);
        return { todaysChunks: escapedChunks, todaysProgress };
      } catch (err) {
        handleResolverError(err);
      }
    },
    calendarChunks: async (_, __, { userInfo }) => {
      try {
        handleAuthentication(userInfo);
        const chunks = await fetchCalendarChunks(userInfo.userId);
        return {
          calendarChunks: escapeCalendarObjects(chunks.calendarChunks),
          calendarExams: escapeCalendarObjects(chunks.calendarExams)
        };
      } catch (err) {
        handleResolverError(err);
      }
    },
    examsCount: async (_, __, { userInfo }) => {
      try {
        handleAuthentication(userInfo);
        const currentExams = await Exam.countDocuments({
          userId: userInfo.userId,
          completed: false
        });
        const finishedExams = await Exam.countDocuments({
          userId: userInfo.userId,
          completed: true
        });
        return { currentExams, finishedExams };
      } catch (err) {
        handleResolverError(err);
      }
    }
  },
  Mutation: {
    addExam: async (_, args, { userInfo }) => {
      try {
        handleAuthentication(userInfo);
        await handleAddExam(args, userInfo);
        return true;
      } catch (err) {
        handleResolverError(err);
      }
    },
    updateExam: async (_, args, { userInfo }) => {
      try {
        handleAuthentication(userInfo);
        const updatedExam = await handleUpdateExam(args, userInfo);
        return escapeExamObject(updatedExam);
      } catch (err) {
        handleResolverError(err);
      }
    },
    updateCurrentPage: async (_, args, { userInfo }) => {
      try {
        handleAuthentication(userInfo);
        await handleUpdateCurrentPage(args, userInfo);
        return true;
      } catch (err) {
        handleResolverError(err);
      }
    },
    examCompleted: async (_, args, { userInfo }) => {
      try {
        handleAuthentication(userInfo);
        await handleExamCompleted(args, userInfo);

        return true;
      } catch (err) {
        handleResolverError(err);
      }
    },
    deleteExam: async (_, args, { userInfo }) => {
      try {
        handleAuthentication(userInfo);
        await handleDeleteExam(args, userInfo);
        return true;
      } catch (err) {
        handleResolverError(err);
      }
    }
  },
  Date: new GraphQLScalarType({
    name: "Date",
    description: "GraphqL date scalar",
    parseValue(value) {
      if (value instanceof Date) return value;
      if (isDateInvalid(value))
        throw new UserInputError(
          "Date input has the wrong format. Valid formats: dd/mm/yyyy, yyyy/mm/dd, mm/dd/yyyy. Valid separators: . / -"
        );
      return new Date(value); // value from the client
    },
    serialize(value) {
      return new Date(value); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value); // ast value is always in string format
      }
      return null;
    }
  })
};
