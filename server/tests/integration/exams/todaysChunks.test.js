//https://www.apollographql.com/docs/apollo-server/testing/testing/
//https://mongoosejs.com/docs/jest.html
import { createTestClient } from "apollo-server-testing";
import {
  setupApolloServer,
  setupDb,
  addTestExam,
  addTestExams,
  clearDatabase,
  teardown,
  getFutureDay
} from "../setup";
import { TodaysChunkCache, Exam } from "../../../models";
import { GET_TODAYS_CHUNKS_AND_PROGRESS } from "../../queries.js";
import {
  EXAM_COMPLETED_MUTATION,
  UPDATE_CURRENT_PAGE_MUTATION,
  UPDATE_EXAM_MUTATION
} from "../../mutations.js";

describe("Test get todays chunks query", () => {
  let server;
  let query;
  let mutate;
  let testExams;

  beforeAll(async () => {
    await setupDb();
    server = await setupApolloServer({ isAuth: true, userId: "samanthasId" });
    let client = createTestClient(server);
    query = client.query;
    mutate = client.mutate;
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await teardown();
  });

  it("should correctly fetch today's chunks", async () => {
    testExams = await addTestExams();

    expect(
      await TodaysChunkCache.countDocuments({
        userId: "samanthasId"
      })
    ).toBe(0);

    const resp = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(resp.data.todaysChunkAndProgress).toBeTruthy();
    expect(resp.data.todaysChunkAndProgress.todaysChunks.length).toBe(3);

    expect(
      await TodaysChunkCache.countDocuments({
        userId: "samanthasId"
      })
    ).toBe(3);
    expect(resp.data.todaysChunkAndProgress.todaysChunks[2]).toMatchObject({
      exam: {
        id: testExams.exam1._id.toString(),
        subject: testExams.exam1.subject,
        examDate: testExams.exam1.examDate,
        startDate: testExams.exam1.startDate,
        totalNumberDays: testExams.exam1.totalNumberDays,
        numberPages: testExams.exam1.numberPages,
        lastPage: testExams.exam1.lastPage,
        timesRepeat: testExams.exam1.timesRepeat,
        currentPage: testExams.exam1.currentPage,
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ]
      },
      numberPagesToday: 10,
      durationToday: 50,
      daysLeft: 5
    });

    expect(resp.data.todaysChunkAndProgress.todaysChunks[1]).toMatchObject({
      exam: {
        id: testExams.exam2._id.toString(),
        subject: testExams.exam2.subject,
        examDate: testExams.exam2.examDate,
        startDate: testExams.exam2.startDate,
        totalNumberDays: testExams.exam2.totalNumberDays,
        numberPages: testExams.exam2.numberPages,
        lastPage: testExams.exam2.lastPage,
        timesRepeat: testExams.exam2.timesRepeat,
        currentPage: testExams.exam2.currentPage,
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ]
      },
      numberPagesToday: 36,
      durationToday: 360,
      daysLeft: 2
    });

    expect(resp.data.todaysChunkAndProgress.todaysChunks[0]).toMatchObject({
      exam: {
        id: testExams.exam3._id.toString(),
        subject: testExams.exam3.subject,
        examDate: testExams.exam3.examDate,
        startDate: testExams.exam3.startDate,
        totalNumberDays: testExams.exam3.totalNumberDays,
        numberPages: testExams.exam3.numberPages,
        lastPage: testExams.exam3.lastPage,
        timesRepeat: testExams.exam3.timesRepeat,
        currentPage: testExams.exam3.currentPage,
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ]
      },
      numberPagesToday: 48,
      durationToday: 480,
      daysLeft: 1
    });
  });

  it("should correctly fetch today's chunks if the cache is not empty", async () => {
    testExams = await addTestExams();
    expect(await TodaysChunkCache.countDocuments()).toBe(0);

    const respFetchChunks = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(respFetchChunks.data.todaysChunkAndProgress).toBeTruthy();
    expect(respFetchChunks.data.todaysChunkAndProgress.todaysChunks.length).toBe(3);

    expect(await TodaysChunkCache.countDocuments({ userId: "samanthasId" })).toBe(3);

    const resp = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(resp.data.todaysChunkAndProgress).toBeTruthy();
    expect(resp.data.todaysChunkAndProgress.todaysChunks.length).toBe(3);

    expect(
      await TodaysChunkCache.countDocuments({
        userId: "samanthasId"
      })
    ).toBe(3);
    expect(resp.data.todaysChunkAndProgress.todaysChunks[2]).toMatchObject({
      exam: {
        id: testExams.exam1._id.toString(),
        subject: testExams.exam1.subject,
        examDate: testExams.exam1.examDate,
        startDate: testExams.exam1.startDate,
        totalNumberDays: testExams.exam1.totalNumberDays,
        numberPages: testExams.exam1.numberPages,
        lastPage: testExams.exam1.lastPage,
        timesRepeat: testExams.exam1.timesRepeat,
        currentPage: testExams.exam1.currentPage,
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ]
      },
      numberPagesToday: 10,
      durationToday: 50,
      daysLeft: 5
    });

    expect(resp.data.todaysChunkAndProgress.todaysChunks[1]).toMatchObject({
      exam: {
        id: testExams.exam2._id.toString(),
        subject: testExams.exam2.subject,
        examDate: testExams.exam2.examDate,
        startDate: testExams.exam2.startDate,
        totalNumberDays: testExams.exam2.totalNumberDays,
        numberPages: testExams.exam2.numberPages,
        lastPage: testExams.exam2.lastPage,
        timesRepeat: testExams.exam2.timesRepeat,
        currentPage: testExams.exam2.currentPage,
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ]
      },
      numberPagesToday: 36,
      durationToday: 360,
      daysLeft: 2
    });

    expect(resp.data.todaysChunkAndProgress.todaysChunks[0]).toMatchObject({
      exam: {
        id: testExams.exam3._id.toString(),
        subject: testExams.exam3.subject,
        examDate: testExams.exam3.examDate,
        startDate: testExams.exam3.startDate,
        totalNumberDays: testExams.exam3.totalNumberDays,
        numberPages: testExams.exam3.numberPages,
        lastPage: testExams.exam3.lastPage,
        timesRepeat: testExams.exam3.timesRepeat,
        currentPage: testExams.exam3.currentPage,
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ]
      },
      numberPagesToday: 48,
      durationToday: 480,
      daysLeft: 1
    });
  });

  it("todaysChunks should be empty, since no exams", async () => {
    expect(await TodaysChunkCache.countDocuments()).toBe(0);
    expect(await Exam.countDocuments()).toBe(0);

    const respFetchChunks = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(respFetchChunks.data.todaysChunkAndProgress).toBeTruthy();
    expect(respFetchChunks.data.todaysChunkAndProgress.todaysChunks.length).toBe(0);
  });

  it("todaysChunks should be empty when exam is completed", async () => {
    const testExam = await addTestExam({
      subject: "Biology",
      completed: false
    });
    expect(await TodaysChunkCache.countDocuments()).toBe(0);
    expect(await Exam.countDocuments()).toBe(1);

    const respFetchChunks = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(respFetchChunks.data.todaysChunkAndProgress).toBeTruthy();
    expect(respFetchChunks.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);
    expect(respFetchChunks.data.todaysChunkAndProgress.todaysChunks[0].completed).toBeFalsy();

    const respExamCompleted = await query({
      query: EXAM_COMPLETED_MUTATION,
      variables: {
        id: testExam._id.toString(),
        completed: true
      }
    });
    expect(respExamCompleted.data).toBeTruthy();

    const completedExam = await Exam.findOne({ _id: testExam._id.toString() });
    expect(completedExam.completed).toBeTruthy();

    const respFetchChunks2 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(respFetchChunks2.data.todaysChunkAndProgress).toBeTruthy();
    expect(respFetchChunks2.data.todaysChunkAndProgress.todaysChunks.length).toBe(0);
  });

  it("todaysChunks should update when exam is updated", async () => {
    const testExam = await addTestExam({
      subject: "Biology"
    });
    expect(await TodaysChunkCache.countDocuments()).toBe(0);
    expect(await Exam.countDocuments()).toBe(1);

    const respFetchChunks = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(await TodaysChunkCache.countDocuments()).toBe(1);

    expect(respFetchChunks.data.todaysChunkAndProgress).toBeTruthy();
    expect(respFetchChunks.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);
    expect(respFetchChunks.data.todaysChunkAndProgress.todaysChunks[0].exam.currentPage).toBe(1);

    //update currentpage to 3 - only current Page should change in chunk
    const updateResp = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: testExam._id.toString(),
        page: 3
      }
    });
    expect(updateResp.data.updateCurrentPage).toBeTruthy();
    const respFetchChunks2 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(respFetchChunks2.data.todaysChunkAndProgress).toBeTruthy();
    expect(respFetchChunks2.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);
    expect(respFetchChunks2.data.todaysChunkAndProgress.todaysChunks[0].exam.currentPage).toBe(3);

    expect(respFetchChunks2.data.todaysChunkAndProgress.todaysChunks[0]).toMatchObject({
      exam: {
        id: testExam._id.toString(),
        subject: testExam.subject,
        examDate: testExam.examDate,
        startDate: testExam.startDate,
        totalNumberDays: testExam.totalNumberDays,
        numberPages: testExam.numberPages,
        lastPage: testExam.lastPage,
        timesRepeat: testExam.timesRepeat,
        currentPage: 3,
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ]
      },
      numberPagesToday:
        respFetchChunks.data.todaysChunkAndProgress.todaysChunks[0].numberPagesToday,
      startPage: respFetchChunks.data.todaysChunkAndProgress.todaysChunks[0].startPage,
      durationToday: respFetchChunks.data.todaysChunkAndProgress.todaysChunks[0].durationToday,
      daysLeft: respFetchChunks.data.todaysChunkAndProgress.todaysChunks[0].daysLeft
    });

    //update exam -  "important changes" - therefore chunk has to be recalculated
    const respUpdateExam = await mutate({
      query: UPDATE_EXAM_MUTATION,
      variables: {
        id: testExam._id.toString(),
        subject: testExam.subject,
        examDate: getFutureDay(testExam.examDate, 2),
        startDate: testExam.startDate,
        currentPage: 23,
        lastPage: 219, //was 50
        timePerPage: 5,
        startPage: 20,
        timesRepeat: 1
      }
    });

    expect(respUpdateExam.data.updateExam).toBeTruthy();
    const respFetchChunks3 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(respFetchChunks3.data.todaysChunkAndProgress.todaysChunks).toBeTruthy();
    expect(respFetchChunks3.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);

    expect(respFetchChunks3.data.todaysChunkAndProgress.todaysChunks[0]).toMatchObject({
      exam: {
        id: testExam._id.toString(),
        subject: testExam.subject,
        examDate: getFutureDay(testExam.examDate, 2),
        startDate: testExam.startDate,
        totalNumberDays: testExam.totalNumberDays + 2,
        numberPages: 200,
        timesRepeat: 1,
        currentPage: 23,
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ]
      },
      numberPagesToday: 29,
      startPage: 23,

      durationToday: 145,
      daysLeft: 7
    });

    //for durationLearned
    // //update Exam again - current progress should still be included
    // const respUpdateExam2 = await mutate({
    //   query: UPDATE_EXAM_MUTATION,
    //   variables: {
    //     id: testExam._id.toString(),
    //     subject: testExam.subject,
    //     examDate: getFutureDay(testExam.examDate, 1),
    //     startDate: testExam.startDate,
    //     currentPage: 23,
    //     lastPage: 219,
    //     timePerPage: 5,
    //     startPage: 20,
    //     timesRepeat: 1
    //   }
    // });

    // expect(respUpdateExam2.data.updateExam).toBeTruthy();
    // const respFetchChunks4 = await query({
    //   query: GET_TODAYS_CHUNKS_AND_PROGRESS
    // });

    // expect(respFetchChunks4.data.todaysChunkAndProgress).toBeTruthy();
    // expect(respFetchChunks4.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);
    // expect(respFetchChunks4.data.todaysChunkAndProgress.todaysChunks[0]).toMatchObject({
    //   exam: {
    //     id: testExam._id.toString(),
    //     subject: testExam.subject,
    //     examDate: getFutureDay(testExam.examDate, 1),
    //     startDate: testExam.startDate,
    //     totalNumberDays: testExam.totalNumberDays + 1,
    //     numberPages: 200,
    //     timesRepeat: 1,
    //     currentPage: 23,
    //     studyMaterialLinks: [
    //       "https://stan-studyplan-staging.herokuapp.com/",
    //       "https://stan-studyplan.herokuapp.com/"
    //     ]
    //   },
    //   numberPagesToday: 32,
    //   startPage: 23,
    //   durationToday: 160,
    //   daysLeft: 6
    // });
  });

  it("only unimportant attribures should update (currentPage, notes, link..), chunk calculations should stay the same", async () => {
    const testExam = await addTestExam({
      subject: "Biology"
    });
    expect(await TodaysChunkCache.countDocuments()).toBe(0);
    expect(await Exam.countDocuments()).toBe(1);

    const respFetchChunks = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(respFetchChunks.data.todaysChunkAndProgress).toBeTruthy();
    expect(respFetchChunks.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);
    expect(respFetchChunks.data.todaysChunkAndProgress.todaysChunks[0].exam.currentPage).toBe(1);

    //update currentpage to 3
    const updateResp = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: testExam._id.toString(),
        page: 3
      }
    });
    expect(updateResp.data.updateCurrentPage).toBeTruthy();

    const updatedChunkFromCache = await TodaysChunkCache.findOne({
      examId: testExam._id.toString(),
      userId: "samanthasId"
    });
    expect(updatedChunkFromCache.currentPage).toBe(3);

    const respFetchChunks2 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(respFetchChunks2.data.todaysChunkAndProgress).toBeTruthy();
    expect(respFetchChunks2.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);
    expect(respFetchChunks2.data.todaysChunkAndProgress.todaysChunks[0].exam.currentPage).toBe(3);
    expect(respFetchChunks2.data.todaysChunkAndProgress.todaysChunks[0].startPage).toBe(1);
    expect(respFetchChunks2.data.todaysChunkAndProgress.todaysChunks[0].completed).toBeFalsy();

    //update current page to last page
    const updateResp2 = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: testExam._id.toString(),
        page: 11
      }
    });
    expect(updateResp2.data.updateCurrentPage).toBeTruthy();
    const respFetchChunks3 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(respFetchChunks3.data.todaysChunkAndProgress).toBeTruthy();
    expect(respFetchChunks3.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);
    expect(respFetchChunks3.data.todaysChunkAndProgress.todaysChunks[0].exam.currentPage).toBe(11);
    expect(respFetchChunks3.data.todaysChunkAndProgress.todaysChunks[0].startPage).toBe(1);
    expect(respFetchChunks3.data.todaysChunkAndProgress.todaysChunks[0].completed).toBeTruthy();
  });

  it("todaysChunks should be completed after finishing learning (current page mutation)", async () => {
    const testExam = await addTestExam({
      subject: "Biology"
    });
    expect(await TodaysChunkCache.countDocuments()).toBe(0);
    expect(await Exam.countDocuments()).toBe(1);

    const respFetchChunks = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(respFetchChunks.data.todaysChunkAndProgress).toBeTruthy();
    expect(respFetchChunks.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);
    expect(respFetchChunks.data.todaysChunkAndProgress.todaysChunks[0].exam.currentPage).toBe(1);

    let completedPage =
      respFetchChunks.data.todaysChunkAndProgress.todaysChunks[0].startPage +
      respFetchChunks.data.todaysChunkAndProgress.todaysChunks[0].numberPagesToday;
    //update currentpage

    const updateResp = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: testExam._id.toString(),
        page: completedPage
      }
    });

    expect(updateResp.data.updateCurrentPage).toBeTruthy();
    const updatedChunk = await TodaysChunkCache.findOne({
      examId: testExam._id.toString()
    });

    expect(updatedChunk.completed).toBeTruthy();

    const respFetchChunks2 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(respFetchChunks2.data.todaysChunkAndProgress).toBeTruthy();
    expect(respFetchChunks2.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);
    expect(respFetchChunks2.data.todaysChunkAndProgress.todaysChunks[0].completed).toBeTruthy();
  });

  it("todaysChunks should be completed after finishing learning (update exam mutation)", async () => {
    const testExam = await addTestExam({
      subject: "Biology"
    });
    expect(await TodaysChunkCache.countDocuments()).toBe(0);
    expect(await Exam.countDocuments()).toBe(1);

    const respFetchChunks = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(respFetchChunks.data.todaysChunkAndProgress).toBeTruthy();
    expect(respFetchChunks.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);
    expect(respFetchChunks.data.todaysChunkAndProgress.todaysChunks[0].exam.currentPage).toBe(1);

    let completedPage =
      respFetchChunks.data.todaysChunkAndProgress.todaysChunks[0].startPage +
      respFetchChunks.data.todaysChunkAndProgress.todaysChunks[0].numberPagesToday;

    //update Exam - current page should complete today's chunk
    const updateResp = await mutate({
      query: UPDATE_EXAM_MUTATION,
      variables: {
        id: testExam._id.toString(),
        subject: testExam.subject,
        examDate: testExam.examDate,
        startDate: testExam.startDate,
        currentPage: completedPage,
        lastPage: testExam.lastPage, //was 50
        timePerPage: testExam.timePerPage,
        startPage: testExam.startPage,
        timesRepeat: testExam.timesRepeat
      }
    });

    expect(updateResp.data.updateExam).toBeTruthy();

    const updatedChunk = await TodaysChunkCache.findOne({
      examId: testExam._id.toString()
    });

    expect(updatedChunk.completed).toBeTruthy();

    const respFetchChunks2 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(respFetchChunks2.data.todaysChunkAndProgress).toBeTruthy();
    expect(respFetchChunks2.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);
    expect(respFetchChunks2.data.todaysChunkAndProgress.todaysChunks[0].completed).toBeTruthy();
  });
});
