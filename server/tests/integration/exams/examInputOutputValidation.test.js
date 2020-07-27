//https://www.apollographql.com/docs/apollo-server/testing/testing/
//https://mongoosejs.com/docs/jest.html
import { createTestClient } from "apollo-server-testing";
import {
  setupApolloServer,
  setupDb,
  clearDatabase,
  getFutureDay,
  teardown,
  addTestExam
} from "../setup";

import { ADD_EXAM_MUTATION, UPDATE_EXAM_MUTATION } from "../../mutations.js";
import {
  GET_EXAM_QUERY,
  GET_EXAMS_QUERY,
  GET_TODAYS_CHUNKS_AND_PROGRESS,
  GET_CALENDAR_CHUNKS
} from "../../queries.js";

describe("Test exam input and output validations/regex/escape", () => {
  let server;
  let mutate;
  let query;
  beforeAll(async () => {
    await setupDb();
    server = await setupApolloServer({
      isAuth: true,
      userId: "samanthasId"
    });
    let client = createTestClient(server);
    mutate = client.mutate;
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await teardown();
  });

  it("should pass the exam regex tests and add an exam", async () => {
    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "Maths",
        examDate: new Date("2120-08-11"),
        startDate: new Date("2120-08-05"),
        lastPage: 5,
        timePerPage: 5,
        startPage: 4,
        notes: "NOTES",
        studyMaterialLinks: [
          " https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ],
        completed: false
      }
    });

    expect(resp.data.addExam).toBeTruthy();
  });

  it("should pass the exam regex tests and add an exam", async () => {
    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "Maths",
        examDate: new Date("2120/08/11"),
        startDate: new Date("2120/08/05"),
        lastPage: 5,
        timePerPage: 5,
        startPage: 4,
        notes: "NOTES",
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ],
        completed: false
      }
    });
    expect(resp.data.addExam).toBeTruthy();
  });

  it("should pass the exam regex tests and add an exam", async () => {
    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "Maths",
        examDate: new Date("2120.08.11"),
        startDate: new Date("2120.08.05"),
        lastPage: 5,
        timePerPage: 5,
        startPage: 4,
        notes: "NOTES",
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ],
        completed: false
      }
    });
    expect(resp.data.addExam).toBeTruthy();
  });

  it("should use regex to filter out wrong subject format", async () => {
    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "",
        examDate: new Date("2120-09-11"),
        startDate: new Date("2120-08-05"),
        lastPage: 5,
        timePerPage: 5,
        startPage: 6,
        notes: "NOTES",
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ],
        completed: false
      }
    });
    expect(resp.data.addExam).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "Subject input has the wrong format. It cannot be empty. Max length 50 characters."
    );
  });

  it("should use regex to filter out wrong exam date format", async () => {
    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "Maths",
        examDate: "test",
        startDate: new Date("2120-08-11"),
        lastPage: 5,
        timePerPage: 5,
        startPage: 6,
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
      'Variable "$examDate" got invalid value "test"; Expected type Date. Date input has the wrong format. Valid formats: dd/mm/yyyy, yyyy/mm/dd, mm/dd/yyyy. Valid separators: . / -'
    );
  });

  it("should use regex to filter out wrong start date format", async () => {
    let resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "Maths",
        examDate: new Date("2120-08-11"),
        startDate: "test",
        lastPage: 5,
        timePerPage: 5,
        startPage: 6,
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
      'Variable "$startDate" got invalid value "test"; Expected type Date. Date input has the wrong format. Valid formats: dd/mm/yyyy, yyyy/mm/dd, mm/dd/yyyy. Valid separators: . / -'
    );
  });

  it("should use regex to filter out wrong start date format", async () => {
    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "Maths",
        examDate: new Date("2150-08-11"),
        startDate: "",
        lastPage: 5,
        timePerPage: 5,
        startPage: 6,
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
      'Variable "$startDate" got invalid value ""; Expected type Date. Date input has the wrong format. Valid formats: dd/mm/yyyy, yyyy/mm/dd, mm/dd/yyyy. Valid separators: . / -'
    );
  });

  it("should not add exam because startPage is null", async () => {
    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "Maths",
        examDate: new Date("2120-08-11"),
        startDate: new Date("2120-08-05"),
        lastPage: 5,
        timePerPage: 0,
        startPage: null,
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
      'Variable "$startPage" of non-null type "Int!" must not be null.'
    );
  });

  it("should use regex to filter out wrong time per page format", async () => {
    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "Maths",
        examDate: new Date("2120-08-11"),
        startDate: new Date("2120-08-05"),
        lastPage: 5,
        timePerPage: 0,
        startPage: 1,
        notes: "NOTES",
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ],
        completed: false
      }
    });

    expect(resp.data.addExam).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "Time per page input has the wrong format. It must be a positive number and cannot be empty. Max length 600 characters."
    );
  });

  it("should use regex to filter out wrong studyMaterialLinks format", async () => {
    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "Maths",
        examDate: new Date("2120-08-11"),
        startDate: new Date("2120-08-05"),
        lastPage: 5,
        timePerPage: 2,
        startPage: 1,
        notes: "NOTES",
        studyMaterialLinks: ["https://stan-studyplan-staging.herokuapp.com/", "42"],
        completed: false
      }
    });

    expect(resp.data.addExam).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "All the study material links have to be URLs (websites) (e.g. https://stan-studyplan.herokuapp.com)."
    );
  });

  it("should use regex to filter out wrong notes format.", async () => {
    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "Maths",
        examDate: new Date("2120-08-11"),
        startDate: new Date("2120-08-05"),
        lastPage: 5,
        timePerPage: 5,
        startPage: 6,
        notes: "d".repeat(100000001),
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ],
        completed: false
      }
    });
    expect(resp.data.addExam).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "Notes input has the wrong format. It cannot exceed 100000000 characters."
    );
  });

  it("should escape all output strings that came from user input", async () => {
    server = await setupApolloServer({
      isAuth: true,
      userId: "samanthasId"
    });
    let client = createTestClient(server);
    mutate = client.mutate;
    query = client.query;

    const testExam = await addTestExam({
      subject: "<script>alert('evil exam')</script>",
      notes: "&<>'\"/"
    });

    //---Get exams query---
    const respExams = await query({
      query: GET_EXAMS_QUERY
    });
    expect(respExams.data.exams).toBeTruthy();
    expect(respExams.data.exams[0].subject).toBe(
      "&lt;script&gt;alert(&#x27;evil exam&#x27;)&lt;&#x2F;script&gt;"
    );
    expect(respExams.data.exams[0].notes).toBe("&amp;&lt;&gt;&#x27;&quot;&#x2F;");

    //---Get exam query---
    const respExam = await query({
      query: GET_EXAM_QUERY,
      variables: {
        id: testExam._id.toString()
      }
    });
    expect(respExam.data.exam).toBeTruthy();
    expect(respExam.data.exam.subject).toBe(
      "&lt;script&gt;alert(&#x27;evil exam&#x27;)&lt;&#x2F;script&gt;"
    );
    expect(respExam.data.exam.notes).toBe("&amp;&lt;&gt;&#x27;&quot;&#x2F;");

    //---Get todays chunks and progress---
    const respTodaysChunks = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(respTodaysChunks.data.todaysChunkAndProgress).toBeTruthy();

    expect(respTodaysChunks.data.todaysChunkAndProgress.todaysChunks[0].exam).toBeTruthy();
    expect(respTodaysChunks.data.todaysChunkAndProgress.todaysChunks[0].exam.subject).toBe(
      "&lt;script&gt;alert(&#x27;evil exam&#x27;)&lt;&#x2F;script&gt;"
    );
    expect(respTodaysChunks.data.todaysChunkAndProgress.todaysChunks[0].exam.notes).toBe(
      "&amp;&lt;&gt;&#x27;&quot;&#x2F;"
    );

    //---Get todays chunks and progress---
    const respCalendarChunks = await query({
      query: GET_CALENDAR_CHUNKS
    });

    expect(respCalendarChunks.data.calendarChunks).toBeTruthy();
    expect(respCalendarChunks.data.calendarChunks.calendarChunks[0].title).toBe(
      "&lt;script&gt;alert(&#x27;evil exam&#x27;)&lt;&#x2F;script&gt;"
    );
    expect(respCalendarChunks.data.calendarChunks.calendarExams[0].title).toBe(
      "&lt;script&gt;alert(&#x27;evil exam&#x27;)&lt;&#x2F;script&gt;"
    );

    //---Update Exam---
    const respUpdateExam = await mutate({
      query: UPDATE_EXAM_MUTATION,
      variables: {
        id: testExam._id.toString(),
        subject: "&<>'\"/",
        examDate: getFutureDay(new Date(), 5),
        startDate: new Date(),
        lastPage: 5,
        timePerPage: 5,
        timesRepeat: 2,
        startPage: 1,
        currentPage: 2
      }
    });

    expect(respUpdateExam.data.updateExam).toBeTruthy();
    expect(respUpdateExam.data.updateExam.subject).toBe("&amp;&lt;&gt;&#x27;&quot;&#x2F;");
  });
});
