//https://www.apollographql.com/docs/apollo-server/testing/testing/
//https://mongoosejs.com/docs/jest.html
import { createTestClient } from "apollo-server-testing";
import {
  setupApolloServer,
  setupDb,
  addTestExam,
  addTestExams,
  clearDatabase,
  teardown
} from "../setup";
import { Exam, TodaysChunkCache } from "../../../models";

import { GET_TODAYS_CHUNKS_AND_PROGRESS } from "../../queries.js";

import {
  UPDATE_CURRENT_PAGE_MUTATION,
  EXAM_COMPLETED_MUTATION,
  DELETE_EXAM_MUTATION
} from "../../mutations.js";

describe("Test todays progress query is calculated correctly", () => {
  let server;
  let query;
  let mutate;

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

  it("should correctly fetch today's chunks progress for the first time today", async () => {
    const initialCount = await TodaysChunkCache.countDocuments();

    const testExam = await addTestExam({
      subject: "Biology"
    });
    const resp = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(resp.data).toBeTruthy();
    expect(resp.data.todaysChunkAndProgress.todaysProgress).toBe(0);
    const newCount = await TodaysChunkCache.countDocuments();
    expect(newCount).toBe(initialCount + 1);

    const updateResp = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: testExam._id.toString(),
        page: 3
      }
    });
    expect(updateResp.data.updateCurrentPage).toBeTruthy();

    const respTodaysChunks = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(respTodaysChunks.data.todaysChunkAndProgress.todaysChunks[0].exam.currentPage).toBe(3);

    const resp2 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(resp2.data).toBeTruthy();
    //2 pages of 10 completed = 20%
    expect(resp2.data.todaysChunkAndProgress.todaysProgress).toBe(20);

    // update current page to 7
    const respUpdate2 = await TodaysChunkCache.updateOne(
      { examId: testExam._id.toString() },
      { currentPage: 7 }
    );
    expect(respUpdate2.ok).toBeTruthy();
    expect(respUpdate2.nModified).toBe(1);

    const resp3 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(resp3.data).toBeTruthy();
    //6 pages of 10 completed = 60%
    expect(resp3.data.todaysChunkAndProgress.todaysProgress).toBe(60);

    const respExamCompleted = await query({
      query: EXAM_COMPLETED_MUTATION,
      variables: {
        id: testExam._id.toString(),
        completed: true
      }
    });

    expect(respExamCompleted.data).toBeTruthy();

    const resp4 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(resp4.data).toBeTruthy();
    //completed = 100%
    expect(resp4.data.todaysChunkAndProgress.todaysProgress).toBe(100);
  });

  it("should correctly fetch today's chunks progress after updating current page (update current page mutation)", async () => {
    //setup
    const testExam = await addTestExam({
      subject: "Biology"
    });
    const initialCount = await TodaysChunkCache.countDocuments();
    expect(initialCount).toBe(0);

    //Current todays chunks progress should be 0
    const resp1 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(resp1.data).toBeTruthy();
    expect(resp1.data.todaysChunkAndProgress.todaysProgress).toBe(0);
    const newCount = await TodaysChunkCache.countDocuments();
    expect(newCount).toBe(initialCount + 1);

    //Update page with mutation (changes the page in the exam)
    const updateResp = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: testExam._id.toString(),
        page: 3
      }
    });
    expect(updateResp.data.updateCurrentPage).toBeTruthy();

    //refetch progress - should have changed
    const resp2 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(resp2.data).toBeTruthy();
    //2 pages of 10 completed = 20%
    expect(resp2.data.todaysChunkAndProgress.todaysProgress).toBe(20);
  });

  it("should correctly fetch today's chunks progress, when there are no chunks today/no exams", async () => {
    const initialCountChunks = await TodaysChunkCache.countDocuments();
    expect(initialCountChunks).toBe(0);
    const initialCountExams = await Exam.countDocuments();
    expect(initialCountExams).toBe(0);

    const respFetchChunks = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(respFetchChunks.data.todaysChunkAndProgress).toBeTruthy();
    expect(respFetchChunks.data.todaysChunkAndProgress.todaysChunks.length).toBe(0);

    const resp1 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(resp1.data).toBeTruthy();
    expect(resp1.data.todaysChunkAndProgress.todaysProgress).toBe(100);
  });

  it("should correctly fetch today's chunks progress when there are multiple exams", async () => {
    //setup
    const { exam1, exam2, exam3, exam4 } = await addTestExams();
    const initialCount = await TodaysChunkCache.countDocuments();
    expect(initialCount).toBe(0);

    //Current todays chunks progress should be 0
    const resp1 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(resp1.data).toBeTruthy();
    expect(resp1.data.todaysChunkAndProgress.todaysProgress).toBe(0);
    const newCount = await TodaysChunkCache.countDocuments();
    expect(newCount).toBe(initialCount + 3);

    /**
     * TOTAL DURATION OF TODAYS CHUNKS:
     * exam1 (Biology): 50, 10 pages -> 5 min per page, startpage 1
     * exam2 (Archeology): 360, 36 pages -> 10 min per page, startpage 20
     * exam3 (Chemistry): 480, 48 pages -> 10 min per page, startpage 160
     * Total duration = 890
     * completed:
     * update exam1: 2*5 -> 10 min completed, 100/890*10 = 1.12%
     * update exam2: 360min + 10min = 370min, 100/890*370 = 41.57%
     * update exam3: 280min + 370min = 650min, 100/890*650 = 73.03%
     */

    //---UPDATE FIRST EXAM---
    const updateResp = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: exam1._id.toString(),
        page: 3
      }
    });
    expect(updateResp.data.updateCurrentPage).toBeTruthy();
    const resp2 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(resp2.data).toBeTruthy();
    expect(resp2.data.todaysChunkAndProgress.todaysProgress).toBe(1);

    //---UPDATE SECOND EXAM---
    const updateResp2 = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: exam2._id.toString(),
        page: 56 //completed
      }
    });
    expect(updateResp2.data.updateCurrentPage).toBeTruthy();
    const updatedChunk = await TodaysChunkCache.findOne({
      examId: exam2._id.toString()
    });
    expect(updatedChunk.completed).toBeTruthy();
    const respFetchCache = await TodaysChunkCache.findOne({
      examId: exam2._id.toString()
    });
    expect(respFetchCache).toBeTruthy();
    expect(respFetchCache.completed).toBeTruthy();
    const resp3 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(resp3.data.todaysChunkAndProgress.todaysProgress).toBe(41);

    //---UPDATE THIRD EXAM---
    const updateResp3 = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: exam3._id.toString(),
        page: 188
      }
    });
    expect(updateResp3.data.updateCurrentPage).toBeTruthy();
    const resp4 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(resp4.data.todaysChunkAndProgress.todaysProgress).toBe(73);

    //---UPDATE FOURTH EXAM---
    //shouldn't affect the results of the progress since the exam is in the future
    const updateResp4 = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: exam4._id.toString(),
        page: 20
      }
    });
    expect(updateResp4.data.updateCurrentPage).toBeTruthy();
    const resp5 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(resp5.data.todaysChunkAndProgress.todaysProgress).toBe(73);
  });

  it("should correctly fetch today's chunks progress after deleting an exam", async () => {
    const initialCount = await TodaysChunkCache.countDocuments();
    const { exam1 } = await addTestExams();

    const resp = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(resp.data).toBeTruthy();
    expect(resp.data.todaysChunkAndProgress.todaysProgress).toBe(0);
    const newCount = await TodaysChunkCache.countDocuments();
    expect(newCount).toBe(initialCount + 3);

    const updateResp = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: exam1._id.toString(),
        page: 3
      }
    });
    expect(updateResp.data.updateCurrentPage).toBeTruthy();
    const resp2 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(resp2.data).toBeTruthy();
    expect(resp2.data.todaysChunkAndProgress.todaysProgress).toBe(1);

    const respDelete = await mutate({
      query: DELETE_EXAM_MUTATION,
      variables: {
        id: exam1._id.toString()
      }
    });
    expect(respDelete.data.deleteExam).toBeTruthy();
    const resp3 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(resp3.data).toBeTruthy();
    expect(resp3.data.todaysChunkAndProgress.todaysProgress).toBe(0);
  });
});
