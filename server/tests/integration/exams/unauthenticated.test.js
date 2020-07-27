//https://www.apollographql.com/docs/apollo-server/testing/testing/
//https://mongoosejs.com/docs/jest.html
import { createTestClient } from "apollo-server-testing";
import { setupApolloServer, setupDb, clearDatabase, teardown } from "../setup";

import {
  ADD_EXAM_MUTATION,
  UPDATE_CURRENT_PAGE_MUTATION,
  UPDATE_EXAM_MUTATION,
  DELETE_EXAM_MUTATION,
  EXAM_COMPLETED_MUTATION
} from "../../mutations.js";
import {
  GET_EXAM_QUERY,
  GET_EXAMS_QUERY,
  GET_TODAYS_CHUNKS_AND_PROGRESS,
  GET_CALENDAR_CHUNKS,
  GET_EXAMS_COUNT
} from "../../queries.js";

describe("Test exam resolvers cannot be accessed if not authenticated", () => {
  let server;
  let mutate;
  let query;
  beforeAll(async () => {
    await setupDb();
    server = await setupApolloServer({ isAuth: false });
    let client = createTestClient(server);
    mutate = client.mutate;
    query = client.query;
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await teardown();
  });

  it("should not be able to add an exam", async () => {
    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "German",
        examDate: "2122-08-11",
        startDate: "2122-08-05",
        lastPage: 5,
        timePerPage: 5,
        startPage: 4,
        notes: "NOTES",
        studyMaterialLinks: ["doesn't matter"],
        completed: false
      }
    });
    expect(resp.data.addExam).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Unauthorised");
  });

  it("should not be able to update the current page", async () => {
    const resp = await mutate({
      query: UPDATE_CURRENT_PAGE_MUTATION,
      variables: {
        id: "testId",
        page: 5
      }
    });

    expect(resp.data.updateCurrentPage).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Unauthorised");
  });

  it("should not be able to fetch an exam", async () => {
    const resp = await query({
      query: GET_EXAM_QUERY,
      variables: {
        id: "testId"
      }
    });
    expect(resp.data.exam).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Unauthorised");
  });

  it("should not be able to fetch exams", async () => {
    const resp = await query({
      query: GET_EXAMS_QUERY
    });
    expect(resp.data.exams).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Unauthorised");
  });

  it("should not be able to fetch todays chunks", async () => {
    const resp = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Unauthorised");
  });

  it("should not be able to fetch calendar chunks", async () => {
    const resp = await query({
      query: GET_CALENDAR_CHUNKS
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Unauthorised");
  });

  it("should not update the exam", async () => {
    const resp = await mutate({
      query: UPDATE_EXAM_MUTATION,
      variables: {
        id: "id",
        subject: "Editable Exam",
        examDate: "2122-08-11",
        startDate: "2122-08-05",
        lastPage: 5,
        timePerPage: 5,
        timesRepeat: 2,
        startPage: 1,
        currentPage: 2
      }
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Unauthorised");
  });

  it("should not fetch the exam counts", async () => {
    const resp = await query({
      query: GET_EXAMS_COUNT
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Unauthorised");
  });

  it("should not be able to complete the exam", async () => {
    const resp = await mutate({
      query: EXAM_COMPLETED_MUTATION,
      variables: {
        id: "makes no difference",
        completed: true
      }
    });

    expect(resp.data.examCompleted).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Unauthorised");
  });

  it("should not delete the exam", async () => {
    const resp = await mutate({
      query: DELETE_EXAM_MUTATION,
      variables: {
        id: "makes no difference"
      }
    });

    expect(resp.deleteExam).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Unauthorised");
  });

  //TODO ADD NEWER RESOLVERS
});
