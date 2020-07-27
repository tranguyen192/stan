//https://www.apollographql.com/docs/apollo-server/testing/testing/
//https://mongoosejs.com/docs/jest.html
import { createTestClient } from "apollo-server-testing";
import {
  setupApolloServer,
  setupDb,
  addTestExam,
  getFutureDay,
  clearDatabase,
  teardown
} from "../setup";
import { Exam } from "../../../models";
import { UPDATE_EXAM_MUTATION } from "../../mutations.js";
import { GET_TODAYS_CHUNKS_AND_PROGRESS } from "../../queries.js";

describe("Test update exam mutation", () => {
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

  it("should update the exam correctly", async () => {
    const testExam = await addTestExam({ subject: "Biology" });
    const initialCount = await Exam.countDocuments();

    const resp = await mutate({
      query: UPDATE_EXAM_MUTATION,
      variables: {
        id: testExam._id.toString(),
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

    expect(resp.data.updateExam).toBeTruthy();
    const newCount = await Exam.countDocuments();
    expect(newCount).toBe(initialCount);
    expect(resp.data.updateExam).toBeTruthy();
    expect(resp.data.updateExam.subject).toBe("Editable Exam");

    const editedExam = await Exam.findOne({
      _id: testExam._id.toString()
    });

    expect(editedExam).toBeTruthy();
    expect(editedExam.subject).toBe("Editable Exam");
  });

  it("should update today's chunk cache correctly", async () => {
    const testExam = await addTestExam({ subject: "Biology" });

    const initialCount = await Exam.countDocuments();
    expect(initialCount).toBe(1);
    const todaysChunks = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(todaysChunks.data.todaysChunkAndProgress).toBeTruthy();
    expect(todaysChunks.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);

    expect(todaysChunks.data.todaysChunkAndProgress.todaysChunks[0].startPage).toBe(1);
    expect(todaysChunks.data.todaysChunkAndProgress.todaysChunks[0].exam.currentPage).toBe(1);

    const resp = await mutate({
      query: UPDATE_EXAM_MUTATION,
      variables: {
        id: testExam._id.toString(),
        subject: "Editable Exam",
        examDate: getFutureDay(new Date(), 5),
        startDate: new Date(),
        lastPage: 5,
        timePerPage: 5,
        timesRepeat: 2,
        startPage: 1,
        currentPage: 2
      }
    });

    expect(resp.data.updateExam).toBeTruthy();
    const todaysChunks2 = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });

    expect(todaysChunks2.data.todaysChunkAndProgress).toBeTruthy();
    expect(todaysChunks2.data.todaysChunkAndProgress.todaysChunks.length).toBe(1);
    expect(todaysChunks2.data.todaysChunkAndProgress.todaysChunks[0].startPage).toBe(2);
    expect(todaysChunks2.data.todaysChunkAndProgress.todaysChunks[0].exam.currentPage).toBe(2);
  });

  it("should update the exam correctly, even thought original unchanged startDate is in the past", async () => {
    const testExamStartDatePast = await addTestExam({
      subject: "Biology",
      startDate: getFutureDay(new Date(), -5)
    });
    const initialCount = await Exam.countDocuments();

    const resp = await mutate({
      query: UPDATE_EXAM_MUTATION,
      variables: {
        id: testExamStartDatePast._id.toString(),
        subject: "Editable Exam 2",
        examDate: "2122-08-11",
        startDate: testExamStartDatePast.startDate,
        lastPage: 5,
        timePerPage: 5,
        timesRepeat: 2,
        startPage: 1,
        currentPage: 2
      }
    });

    expect(resp.data.updateExam).toBeTruthy();
    const newCount = await Exam.countDocuments();
    expect(newCount).toBe(initialCount);
    expect(resp.data.updateExam).toBeTruthy();
    expect(resp.data.updateExam.subject).toBe("Editable Exam 2");

    const editedExam = await Exam.findOne({
      _id: testExamStartDatePast._id.toString()
    });

    expect(editedExam).toBeTruthy();
    expect(editedExam.subject).toBe("Editable Exam 2");
  });

  it("should not update the exam correctly, even thought original unchanged startDate is in the past, it is now after the exam date", async () => {
    const testExamStartDatePast = await addTestExam({
      subject: "Biology",
      startDate: getFutureDay(new Date(), -5)
    });
    const resp = await mutate({
      query: UPDATE_EXAM_MUTATION,
      variables: {
        id: testExamStartDatePast._id.toString(),
        subject: "Editable Exam 2",
        examDate: "1999-08-11",
        startDate: testExamStartDatePast.startDate,
        lastPage: 5,
        timePerPage: 5,
        timesRepeat: 2,
        startPage: 1,
        currentPage: 2
      }
    });

    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Start learning date must be before exam date.");
  });

  it("should not update the exam, since the exam doesn't exist", async () => {
    const testExam = await addTestExam({ subject: "Biology" });

    let falseId = "5e923a29a39c7738fb50e632";
    if (testExam._id.toString() === falseId) falseId = "5e923a29a39c7738fb50e635";
    const resp = await mutate({
      query: UPDATE_EXAM_MUTATION,
      variables: {
        id: falseId,
        subject: "German",
        examDate: "2122-08-05",
        startDate: "2122-08-11",
        lastPage: 5,
        timePerPage: 5,
        startPage: 4,
        timesRepeat: 2,
        currentPage: 5,
        notes: "NOTES",
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ],
        completed: false
      }
    });

    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("This exam does not exist.");
  });

  it("should not update the exam, since start date is after exam date", async () => {
    const testExam = await addTestExam({ subject: "Biology" });

    const resp = await mutate({
      query: UPDATE_EXAM_MUTATION,
      variables: {
        id: testExam._id.toString(),
        subject: "German",
        examDate: "2122-08-05",
        startDate: "2122-08-11",
        lastPage: 5,
        timePerPage: 5,
        startPage: 4,
        timesRepeat: 2,
        currentPage: 5,
        notes: "NOTES",
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ],
        completed: false
      }
    });

    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "Dates cannot be in the past and start learning date must be before exam date."
    );
  });

  it("should not update the exam, since start date is the same as exam date", async () => {
    const testExam = await addTestExam({ subject: "Biology" });

    const resp = await mutate({
      query: UPDATE_EXAM_MUTATION,
      variables: {
        id: testExam._id.toString(),
        subject: "German",
        examDate: "2122-08-05",
        startDate: "2122-08-05",
        lastPage: 5,
        timePerPage: 5,
        startPage: 4,
        timesRepeat: 2,
        currentPage: 5,
        notes: "NOTES",
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ],
        completed: false
      }
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "Careful! You shouldn't start learning on the same day as the test. Start date should be at least 1 day before the test."
    );
  });

  it("should not update the exam, since dates are in the past", async () => {
    const testExam = await addTestExam({ subject: "Biology" });

    const resp = await mutate({
      query: UPDATE_EXAM_MUTATION,
      variables: {
        id: testExam._id.toString(),
        subject: "German",
        examDate: "1922-08-05",
        startDate: "1922-08-11",
        lastPage: 5,
        timePerPage: 5,
        startPage: 4,
        timesRepeat: 2,
        currentPage: 5,
        notes: "NOTES",
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ],
        completed: false
      }
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "Dates cannot be in the past and start learning date must be before exam date."
    );
  });
});
