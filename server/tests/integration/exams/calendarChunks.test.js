//https://www.apollographql.com/docs/apollo-server/testing/testing/
//https://mongoosejs.com/docs/jest.html
import { createTestClient } from "apollo-server-testing";
import {
  setupApolloServer,
  setupDb,
  addTestExam,
  addTestExams,
  clearDatabase,
  getFutureDay,
  teardown
} from "../setup";
import { GET_CALENDAR_CHUNKS } from "../../queries.js";

describe("Test get calendar chunks query", () => {
  let server;
  let query;

  beforeAll(async () => {
    await setupDb();
    server = await setupApolloServer({ isAuth: true, userId: "samanthasId" });
    let client = createTestClient(server);
    query = client.query;
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await teardown();
  });

  it("should correctly fetch the calendar chunks", async () => {
    const testExams = await addTestExams();
    const resp = await query({
      query: GET_CALENDAR_CHUNKS
    });

    expect(resp.data.calendarChunks).toBeTruthy();
    expect(resp.data.calendarChunks.calendarChunks.length).toBe(4);
    let exam;
    const examColor = "#ff554d";

    exam = testExams.exam1;
    expect(resp.data.calendarChunks.calendarChunks[2]).toMatchObject({
      title: exam.subject,
      start: exam.startDate,
      end: getFutureDay(exam.examDate, -1),
      color: exam.color,
      extendedProps: {
        examDate: exam.examDate,
        currentPage: exam.currentPage,
        numberPagesLeftTotal: 50,
        numberPagesPerDay: 10,
        durationTotal: 250,
        durationPerDay: 50,
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ]
      }
    });

    expect(resp.data.calendarChunks.calendarExams[2]).toMatchObject({
      title: exam.subject,
      start: exam.examDate,
      end: exam.examDate,
      color: examColor
    });

    exam = testExams.exam2;
    expect(resp.data.calendarChunks.calendarChunks[1]).toMatchObject({
      title: exam.subject,
      start: exam.startDate,
      end: getFutureDay(exam.examDate, -1),
      color: exam.color,
      extendedProps: {
        examDate: exam.examDate,
        currentPage: exam.currentPage,
        numberPagesLeftTotal: 71,
        numberPagesPerDay: 36,
        durationTotal: 710,
        durationPerDay: 360,
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ]
      }
    });
    expect(resp.data.calendarChunks.calendarExams[1]).toMatchObject({
      title: exam.subject,
      start: exam.examDate,
      end: exam.examDate,
      color: examColor
    });

    exam = testExams.exam3;
    expect(resp.data.calendarChunks.calendarChunks[0]).toMatchObject({
      title: exam.subject,
      start: exam.startDate,
      end: getFutureDay(exam.examDate, -1),
      color: exam.color,
      extendedProps: {
        examDate: exam.examDate,
        currentPage: exam.currentPage,
        numberPagesLeftTotal: 48,
        numberPagesPerDay: 48,
        durationTotal: 480,
        durationPerDay: 480,
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ]
      }
    });
    expect(resp.data.calendarChunks.calendarExams[0]).toMatchObject({
      title: exam.subject,
      start: exam.examDate,
      end: exam.examDate,
      color: examColor
    });

    exam = testExams.exam4;

    expect(resp.data.calendarChunks.calendarChunks[3]).toMatchObject({
      title: exam.subject,
      start: exam.startDate,
      end: getFutureDay(exam.examDate, -1),
      color: exam.color,
      extendedProps: {
        examDate: exam.examDate,
        currentPage: exam.currentPage,
        numberPagesLeftTotal: 50,
        numberPagesPerDay: 3,
        durationTotal: 250,
        durationPerDay: 15,
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ]
      }
    });
    expect(resp.data.calendarChunks.calendarExams[3]).toMatchObject({
      title: exam.subject,
      start: exam.examDate,
      end: exam.examDate,
      color: examColor
    });
  });

  it("should make sure that calendar chunks are empty, since the exam date in only exam added is today", async () => {
    await addTestExam({
      subject: "Biology",
      examDate: new Date()
    });
    const resp = await query({
      query: GET_CALENDAR_CHUNKS
    });

    expect(resp.data.calendarChunks).toBeTruthy();
    expect(resp.data.calendarChunks.calendarChunks.length).toBe(0);
  });
});
