//https://www.apollographql.com/docs/apollo-server/testing/testing/
//https://mongoosejs.com/docs/jest.html
import "dotenv/config";
import { createTestClient } from "apollo-server-testing";
import {
  setupApolloServer,
  setupDb,
  signUpTestUser,
  // addTestExam,
  addTestExams,
  clearDatabase,
  teardown
} from "../setup";
import { DELETE_USER_MUTATION } from "../../mutations.js";
import { GET_EXAMS_QUERY, GET_TODAYS_CHUNKS_AND_PROGRESS } from "../../queries.js";
import { User, Exam, TodaysChunkCache } from "../../../models";

describe("Test delete user mutation", () => {
  let server;
  let mutate;
  let query;
  let testUser;
  let client;

  beforeAll(async () => {
    await setupDb();
  });
  beforeEach(async () => {
    testUser = await signUpTestUser();
    server = await setupApolloServer({
      isAuth: true,
      userId: testUser._id,
      user: testUser
    });

    client = createTestClient(server);
    mutate = client.mutate;
    query = client.query;
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await teardown();
  });

  it("should logout & delete the current logged in user, as well as delete all their data (exams, cache, tokens...)", async () => {
    await addTestExams(testUser._id);

    //count number of users
    const initialCount = await User.countDocuments();
    const initialUser = await User.findOne({ _id: testUser._id.toString() });
    expect(initialUser).toBeTruthy();

    //fill chunk cache
    const todaysChunks = await query({
      query: GET_TODAYS_CHUNKS_AND_PROGRESS
    });
    expect(todaysChunks.data.todaysChunkAndProgress).toBeTruthy();
    expect(todaysChunks.data.todaysChunkAndProgress.todaysChunks.length).toBe(3);
    expect(await TodaysChunkCache.countDocuments({ userId: testUser._id })).toBe(3);

    //count number of exams for this user
    const respExams = await query({
      query: GET_EXAMS_QUERY
    });
    expect(respExams.data.exams).toBeTruthy();
    expect(respExams.data.exams.length).toBe(4);

    //delete user and all of the user's data
    const respDelete = await mutate({
      query: DELETE_USER_MUTATION,
      variables: {
        id: testUser._id.toString()
      }
    });

    //check user was deleted
    expect(respDelete.data).toBeTruthy();
    const newCount = await User.countDocuments();
    expect(newCount).toBe(initialCount - 1);
    const userAfterDelete = await User.findOne({
      _id: testUser._id.toString()
    });
    expect(userAfterDelete).toBeFalsy();

    //check user's data was deleted
    const respExamsAfterDelete = await query({
      query: GET_EXAMS_QUERY
    });
    expect(respExamsAfterDelete.data.exams).toBeTruthy();
    expect(respExamsAfterDelete.data.exams.length).toBe(0);

    expect(await Exam.countDocuments({ userId: testUser._id })).toBe(0);
    expect(await TodaysChunkCache.countDocuments({ userId: testUser._id })).toBe(0);

    //check that a non existing user cannot be deleted (although normally the error would be "Unauthorised")
    const respDelete2 = await mutate({
      query: DELETE_USER_MUTATION,
      variables: {
        id: testUser._id.toString()
      }
    });
    expect(respDelete2.data.deleteUser).toBeFalsy();
    expect(respDelete2.errors[0].message).toEqual(
      "The user couldn't be deleted. Please contact us at stan.studyplan@gmail.com, to delete your account."
    );
  });

  it("should correctly logout & delete the current logged in user, even though they have no exams ", async () => {
    //count number of users
    const initialCount = await User.countDocuments();
    const initialUser = await User.findOne({ _id: testUser._id.toString() });
    expect(initialUser).toBeTruthy();

    //count number of exams for this user
    const respExams = await query({
      query: GET_EXAMS_QUERY
    });
    expect(respExams.data.exams).toBeTruthy();
    expect(respExams.data.exams.length).toBe(0);

    //delete user and all of the user's data
    const respDelete = await mutate({
      query: DELETE_USER_MUTATION,
      variables: {
        id: testUser._id.toString()
      }
    });
    //check user was deleted
    expect(respDelete.data).toBeTruthy();
    const newCount = await User.countDocuments();
    expect(newCount).toBe(initialCount - 1);
    const userAfterDelete = await User.findOne({
      _id: testUser._id.toString()
    });
    expect(userAfterDelete).toBeFalsy();
  });
});
