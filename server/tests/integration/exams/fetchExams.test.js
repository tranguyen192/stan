//https://www.apollographql.com/docs/apollo-server/testing/testing/
//https://mongoosejs.com/docs/jest.html
import { createTestClient } from "apollo-server-testing";
import { setupApolloServer, setupDb, addTestExam, clearDatabase, teardown } from "../setup";

import { GET_EXAM_QUERY, GET_EXAMS_QUERY, GET_EXAMS_COUNT } from "../../queries.js";

describe("Test get exams queries", () => {
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

  it("should fetch the test exam", async () => {
    const exam = await addTestExam("Samantha's Exam");

    const resp = await query({
      query: GET_EXAM_QUERY,
      variables: {
        id: exam._id.toString()
      }
    });

    expect(resp.data.exam).toBeTruthy();
    expect(exam.subject).toBe(resp.data.exam.subject);
    expect(exam.examDate.toString()).toBe(resp.data.exam.examDate.toString());
    expect(exam.startDate.toString()).toBe(resp.data.exam.startDate.toString());
    expect(exam.lastPage).toBe(resp.data.exam.lastPage);
    expect(exam.numberPages).toBe(resp.data.exam.numberPages);
    expect(exam.timePerPage).toBe(resp.data.exam.timePerPage);
    expect(exam.timesRepeat).toBe(resp.data.exam.timesRepeat);
    expect(exam.startPage).toBe(resp.data.exam.startPage);
    expect(exam.currentPage).toBe(resp.data.exam.currentPage);
    expect(exam.studyMaterialLinks.length).toBe(resp.data.exam.studyMaterialLinks.length);
    expect(exam.studyMaterialLinks[0]).toBe(resp.data.exam.studyMaterialLinks[0]);
    expect("Samantha&#x27;s notes").toBe(resp.data.exam.notes);
    expect(exam.completed).toBe(resp.data.exam.completed);
  });

  it("should not fetch an exam, wrong id", async () => {
    const resp = await query({
      query: GET_EXAM_QUERY,
      variables: {
        id: "5e8ef5f1800a7ded589961a4" //false Id
      }
    });

    expect(resp.data.exam).toBeFalsy();
  });

  it("should fetch all exams", async () => {
    await addTestExam({ subject: "Biology" });
    await addTestExam({ subject: "Archeology" });
    await addTestExam({ subject: "Dance" });
    await addTestExam({ subject: "English", userId: "NotSamanthasId" });
    const exam = await addTestExam({ subject: "Chemistry" });

    const resp = await query({
      query: GET_EXAMS_QUERY
    });

    expect(resp.data.exams).toBeTruthy();

    //Check order
    expect(resp.data.exams[0].subject).toBe("Archeology");
    expect(resp.data.exams[1].subject).toBe("Biology");
    expect(resp.data.exams[2].subject).toBe("Chemistry");
    expect(resp.data.exams[3].subject).toBe("Dance");

    //Check one exam
    expect(exam.examDate.toString()).toBe(resp.data.exams[2].examDate.toString());
    expect(exam.startDate.toString()).toBe(resp.data.exams[2].startDate.toString());
    expect(exam.lastPage).toBe(resp.data.exams[2].lastPage);
    expect(exam.numberPages).toBe(resp.data.exams[2].numberPages);
    expect(exam.timePerPage).toBe(resp.data.exams[2].timePerPage);
    expect(exam.timesRepeat).toBe(resp.data.exams[2].timesRepeat);
    expect(exam.startPage).toBe(resp.data.exams[2].startPage);
    expect(exam.currentPage).toBe(resp.data.exams[2].currentPage);
    expect(exam.studyMaterialLinks.length).toBe(resp.data.exams[2].studyMaterialLinks.length);
    expect(exam.studyMaterialLinks[0]).toBe(resp.data.exams[2].studyMaterialLinks[0]);
    expect("Samantha&#x27;s notes").toBe(resp.data.exams[2].notes);
    expect(exam.completed).toBe(resp.data.exams[2].completed);
  });

  it("should fetch empty array", async () => {
    const resp = await query({
      query: GET_EXAMS_QUERY
    });

    expect(resp.data.exams).toBeTruthy();
    expect(resp.data.exams.length).toBe(0);
  });

  it("should fetch the exam counts correctly", async () => {
    await addTestExam({ subject: "Biology" });
    await addTestExam({ subject: "Archeology" });
    await addTestExam({ subject: "Dance" });
    await addTestExam({ subject: "English", completed: true });
    await addTestExam({ subject: "Chemistry" });
    const resp = await query({
      query: GET_EXAMS_COUNT
    });

    expect(resp.data.examsCount).toBeTruthy();
    expect(resp.data.examsCount.currentExams).toBe(4);
    expect(resp.data.examsCount.finishedExams).toBe(1);
  });

  it("should fetch the exam counts correctly (even though there are no exams)", async () => {
    const resp = await query({
      query: GET_EXAMS_COUNT
    });

    expect(resp.data.examsCount).toBeTruthy();
    expect(resp.data.examsCount.currentExams).toBe(0);
    expect(resp.data.examsCount.finishedExams).toBe(0);
  });
});
