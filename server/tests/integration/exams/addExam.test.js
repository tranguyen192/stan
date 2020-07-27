//https://www.apollographql.com/docs/apollo-server/testing/testing/
//https://mongoosejs.com/docs/jest.html
import { createTestClient } from "apollo-server-testing";
import { setupApolloServer, setupDb, clearDatabase, teardown } from "../setup";
import { Exam } from "../../../models";
import { ADD_EXAM_MUTATION } from "../../mutations.js";

//TODO: add totalNumberDays to the test
describe("Test add exam mutation", () => {
  let server;
  let mutate;
  beforeAll(async () => {
    await setupDb();
    server = await setupApolloServer({ isAuth: true, userId: "samanthasId" });
    let client = createTestClient(server);
    mutate = client.mutate;
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await teardown();
  });

  it("should add an exam", async () => {
    const initialCount = await Exam.countDocuments();

    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "MyStanTestExam",
        examDate: "2122.08.11",
        startDate: "2122.08.05",
        lastPage: 5,
        timePerPage: 5,
        startPage: 4,
        notes: "My Test Notes",
        studyMaterialLinks: ["https://stan-studyplan-staging.herokuapp.com/"],
        completed: false
      }
    });
    expect(resp.data.addExam).toBeTruthy();
    const newCount = await Exam.countDocuments();
    expect(newCount).toBe(initialCount + 1);

    const exam = await Exam.findOne({
      subject: "MyStanTestExam"
    });

    expect(exam).toBeTruthy();
    expect(exam.subject).toBe("MyStanTestExam");
    expect(exam.examDate.toString()).toBe(new Date("2122.08.11").toString());
    expect(exam.startDate.toString()).toBe(new Date("2122.08.05").toString());
    expect(exam.totalNumberDays).toBe(6);
    expect(exam.lastPage).toBe(5);
    expect(exam.numberPages).toBe(2);
    expect(exam.timePerPage).toBe(5);
    expect(exam.timesRepeat).toBe(1);
    expect(exam.startPage).toBe(4);
    expect(exam.currentPage).toBe(4);
    expect(exam.notes).toBe("My Test Notes");
    expect(exam.completed).toBe(false);

    const resp2 = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "German",
        examDate: "2122-08-06",
        startDate: "2122-08-05",
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
    expect(resp2.data.addExam).toBeTruthy();
    const newCount2 = await Exam.countDocuments();
    expect(newCount2).toBe(initialCount + 2);

    const resp3 = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "German",
        examDate: new Date("2122-08-06"),
        startDate: "2122-08-05",
        lastPage: 5,
        timePerPage: 5,
        startPage: 4,
        notes: "NOTES",
        studyMaterialLinks: [],
        completed: false
      }
    });
    expect(resp3.data.addExam).toBeTruthy();
    const newCount3 = await Exam.countDocuments();
    expect(newCount3).toBe(initialCount + 3);
  });

  it("should not add an exam, since start date is after exam date", async () => {
    const initialCount = await Exam.countDocuments();

    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "German",
        examDate: "2122-08-05",
        startDate: "2122-08-11",
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
    expect(resp.data.addExam).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "Dates cannot be in the past and start learning date must be before exam date."
    );
    const newCount = await Exam.countDocuments();
    expect(newCount).toBe(initialCount);
  });

  it("should not add an exam, since start date is the same as exam date", async () => {
    const initialCount = await Exam.countDocuments();

    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "German",
        examDate: "2122-08-05",
        startDate: "2122-08-05",
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
    expect(resp.data.addExam).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "Careful! You shouldn't start learning on the same day as the test. Start date should be at least 1 day before the test."
    );
    const newCount = await Exam.countDocuments();
    expect(newCount).toBe(initialCount);
  });

  it("should not add an exam, since dates are in the past", async () => {
    const initialCount = await Exam.countDocuments();

    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "German",
        examDate: "1922-08-05",
        startDate: "1922-08-11",
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
    expect(resp.data.addExam).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "Dates cannot be in the past and start learning date must be before exam date."
    );
    const newCount = await Exam.countDocuments();
    expect(newCount).toBe(initialCount);
  });

  it("should not add an exam, since start page is higher than number of pages", async () => {
    const initialCount = await Exam.countDocuments();

    const resp = await mutate({
      query: ADD_EXAM_MUTATION,
      variables: {
        subject: "German",
        examDate: "2122-08-05",
        startDate: "2122-08-02",
        lastPage: 5,
        timePerPage: 5,
        startPage: 40,
        notes: "NOTES",
        studyMaterialLinks: [
          "https://stan-studyplan-staging.herokuapp.com/",
          "https://stan-studyplan.herokuapp.com/"
        ],
        completed: false
      }
    });
    expect(resp.data.addExam).toBeFalsy();
    expect(resp.errors[0].message).toEqual("The last page should be higher than the start page.");
    const newCount = await Exam.countDocuments();
    expect(newCount).toBe(initialCount);
  });
});
