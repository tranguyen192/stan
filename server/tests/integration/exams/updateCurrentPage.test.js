//https://www.apollographql.com/docs/apollo-server/testing/testing/
//https://mongoosejs.com/docs/jest.html
import { createTestClient } from "apollo-server-testing";
import {
  setupApolloServer,
  setupDb,
  addTestExam,
  // clearDatabase,
  teardown
} from "../setup";
import { Exam } from "../../../models";
import { ADD_EXAM_MUTATION, UPDATE_CURRENT_PAGE_MUTATION } from "../../mutations.js";
import { GET_TODAYS_CHUNKS_AND_PROGRESS } from "../../queries.js";

describe("Test update currentPage mutation", () => {
  let server;
  let mutate;
  let query;
  beforeAll(async () => {
    await setupDb();
    server = await setupApolloServer({ isAuth: true, userId: "samanthasId" });
    let client = createTestClient(server);
    mutate = client.mutate;
    query = client.query;
  });

  // afterEach(async () => {
  //   await clearDatabase();
  // });

  afterAll(async () => {
    await teardown();
  });

  it("should update current page if correct", async () => {
    const initialCount = await Exam.countDocuments();

    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "Editable Exam",
        examDate: "2122-08-11",
        startDate: "2122-08-05",
        lastPage: 5,
        timePerPage: 5,
        startPage: 1,
        notes: "My Test Notes",
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ],
        completed: false
      }
    });
    expect(resp.data.addExam).toBeTruthy();
    const newCount = await Exam.countDocuments();
    expect(newCount).toBe(initialCount + 1);

    const exam = await Exam.findOne({
      subject: "Editable Exam"
    });

    expect(exam).toBeTruthy();
    expect(exam.currentPage).toBe(1);

    const updateResp = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: exam._id.toString(),
        page: 5
      }
    });
    expect(updateResp.data.updateCurrentPage).toBeTruthy();

    const newExam = await Exam.findOne({
      subject: "Editable Exam"
    });

    expect(newExam).toBeTruthy();
    expect(newExam.currentPage).toBe(5);

    const updateResp2 = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: exam._id.toString(),
        page: 50
      }
    });
    expect(updateResp2.data.updateCurrentPage).toBeFalsy();
    expect(updateResp2.errors[0].message).toEqual(
      "The entered current page is higher than the number of pages for this exam."
    );

    const updateResp3 = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: exam._id.toString(),
        page: 0
      }
    });
    expect(updateResp3.data.updateCurrentPage).toBeFalsy();
    expect(updateResp3.errors[0].message).toEqual(
      "The entered current page is lower than the start page for this exam."
    );
  });

  it("should not update current page, examId doesn't exist", async () => {
    const resp = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: "5e8ef5f1800a7ded589961a4", //false Id
        page: 5
      }
    });
    expect(resp.data.updateCurrentPage).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "There is no exam with the id: 5e8ef5f1800a7ded589961a4 for that user."
    );
  });

  it("should update current page in the cache", async () => {
    const testExam = await addTestExam({ subject: "Biology" });
    const todaysChunks = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(todaysChunks.data.todaysChunkAndProgress).toBeTruthy();
    expect(todaysChunks.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);
    expect(todaysChunks.data.todaysChunkAndProgress.todaysChunks[0].exam.currentPage).toBe(1);

    const updateResp = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: testExam._id.toString(),
        page: 3
      }
    });
    expect(updateResp.data.updateCurrentPage).toBeTruthy();

    const todaysChunks2 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(todaysChunks2.data.todaysChunkAndProgress).toBeTruthy();
    expect(todaysChunks2.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);
    expect(todaysChunks2.data.todaysChunkAndProgress.todaysChunks[0].exam.currentPage).toBe(3);
  });
});
