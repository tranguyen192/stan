//https://www.apollographql.com/docs/apollo-server/testing/testing/
//https://mongoosejs.com/docs/jest.html
import { createTestClient } from "apollo-server-testing";
import { setupApolloServer, setupDb, addTestExam, clearDatabase, teardown } from "../setup";
import { Exam, TodaysChunkCache } from "../../../models";
import { DELETE_EXAM_MUTATION } from "../../mutations.js";
import { GET_TODAYS_CHUNKS_AND_PROGRESS } from "../../queries.js";

describe("Test delete exam mutation", () => {
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

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await teardown();
  });

  it("should delete exam1", async () => {
    const testExam = await addTestExam({ subject: "Biology" });

    const initialCount = await Exam.countDocuments();

    const resp = await mutate({
      query: DELETE_EXAM_MUTATION,
      variables: {
        id: testExam._id.toString()
      }
    });

    expect(resp.data).toBeTruthy();
    expect(await Exam.countDocuments({ userId: "samanthasId" })).toBe(initialCount - 1);
    expect(
      await Exam.countDocuments({
        _id: testExam._id.toString(),
        userId: "samanthasId"
      })
    ).toBe(0);
  });

  it("should delete cache when exam1 is deleted", async () => {
    const testExam = await addTestExam({ subject: "Biology" });

    const initialCount = await Exam.countDocuments();
    const todaysChunks = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(todaysChunks.data.todaysChunkAndProgress.todaysChunks).toBeTruthy();
    expect(todaysChunks.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);

    const todaysChunksCount = await TodaysChunkCache.countDocuments({
      examId: testExam._id.toString(),
      userId: "samanthasId"
    });

    expect(todaysChunksCount).toBe(1);
    const resp = await mutate({
      query: DELETE_EXAM_MUTATION,
      variables: {
        id: testExam._id.toString()
      }
    });

    expect(resp.data).toBeTruthy();
    expect(await Exam.countDocuments({ userId: "samanthasId" })).toBe(initialCount - 1);
    expect(
      await Exam.countDocuments({
        _id: testExam._id.toString(),
        userId: "samanthasId"
      })
    ).toBe(0);
    expect(
      await TodaysChunkCache.countDocuments({
        examId: testExam._id.toString(),
        userId: "samanthasId"
      })
    ).toBe(0);
  });

  it("shouldn't delete an exam that doesn't exist", async () => {
    const testExam = await addTestExam({ subject: "Biology" });

    let falseId = "5e923a29a39c7738fb50e632";
    if (testExam._id.toString() === falseId) falseId = "5e923a29a39c7738fb50e635";
    const initialCount = await Exam.countDocuments();

    const resp = await mutate({
      query: DELETE_EXAM_MUTATION,
      variables: {
        id: falseId
      }
    });

    expect(resp.data.deleteExam).toBeFalsy();
    expect(resp.errors[0].message).toEqual("This exam does not exist.");
    const newCount = await Exam.countDocuments();
    expect(newCount).toBe(initialCount);
  });
});
