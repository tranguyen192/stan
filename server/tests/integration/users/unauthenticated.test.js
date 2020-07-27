import "dotenv/config";
import { createTestClient } from "apollo-server-testing";
import { setupApolloServer, setupDb, clearDatabase, teardown } from "../setup";
import {
  LOGIN_MUTATION,
  SIGNUP_MUTATION,
  UPDATE_MASCOT_MUTATION,
  UPDATE_USER_MUTATION,
  LOGOUT_MUTATION,
  DELETE_USER_MUTATION,
  // FORGOTTEN_PASSWORD_EMAIL
  GOOGLE_LOGIN_MUTATION
} from "../../mutations.js";
import { CURRENT_USER } from "../../queries.js";
import { User } from "../../../models";
import jwt from "jsonwebtoken";

describe("Test resolvers are accessed correctly when the user is unauthenticated", () => {
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

  it("should sign up a user", async () => {
    const initialCount = await User.countDocuments();
    const resp = await mutate({
      query: SIGNUP_MUTATION,
      variables: {
        username: "Stan",
        email: "user@stan.com",
        password: "12345678",
        mascot: 1,
        allowEmailNotifications: false
      }
    });

    expect(resp.data.signup).toBeTruthy();

    const newCount = await User.countDocuments();
    expect(newCount).toBe(initialCount + 1);

    const user = await User.findOne({
      username: "Stan",
      email: "user@stan.com"
    });

    expect(user).toBeTruthy();
    // expect(user.id).toBe(resp.data.signup.user.id);
    expect(user.username).toBe("Stan");
    expect(user.email).toBe("user@stan.com");
    expect(user.mascot).toBe(1);
    expect(user.googleId).toBe("");
    expect(user.googleLogin).toBe(false);

    //Test accesstoken
    expect(resp.data.signup).toBeDefined();
    const decodedToken = jwt.verify(resp.data.signup, process.env.ACCESS_TOKEN_SECRET);
    expect(decodedToken).toBeTruthy();
    expect(decodedToken.userId).toBe(user.id);
    expect(decodedToken.tokenVersion).toBe(0);
  });

  it("should not sign the user up again with the same email address", async () => {
    await signUserUp("Stan2", "user2@stan.com", "12345678");

    const resp = await mutate({
      query: SIGNUP_MUTATION,
      variables: {
        username: "Stan",
        email: "user2@stan.com",
        password: "12345678",
        mascot: 1,
        allowEmailNotifications: false
      }
    });

    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("User with email already exists, choose another one.");
  });

  it("should not update the mascot for a user", async () => {
    const resp = await mutate({
      query: UPDATE_MASCOT_MUTATION,
      variables: {
        mascot: 2
      }
    });
    expect(resp.data.updateMascot).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Unauthorised");

    const resp2 = await mutate({
      query: UPDATE_MASCOT_MUTATION,
      variables: {
        mascot: 5
      }
    });

    expect(resp2.data.updateMascot).toBeFalsy();
    expect(resp2.errors[0].message).toEqual("Unauthorised");
  });

  it("should not delete the user", async () => {
    const resp = await mutate({
      query: DELETE_USER_MUTATION
    });
    expect(resp.data.deleteUser).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Unauthorised");
  });

  it("should not update the user", async () => {
    const resp = await mutate({
      query: UPDATE_USER_MUTATION,
      variables: {
        username: "Samantha's new username",
        email: "newSamantha@node.com",
        password: "samantha",
        newPassword: "12345678",
        mascot: 2,
        allowEmailNotifications: false
      }
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Unauthorised");
  });

  //_----------------------------------LOGIN----------------------------------
  it("should login an existing user", async () => {
    await signUserUp("Stan3", "user3@stan.com", "12345678");

    const initialCount = await User.countDocuments();
    const resp = await mutate({
      query: LOGIN_MUTATION,
      variables: {
        email: "user3@stan.com",
        password: "12345678"
      }
    });
    expect(resp.data.login).toBeTruthy();

    const newCount = await User.countDocuments();
    expect(newCount).toBe(initialCount);

    //Test accesstoken
    expect(resp.data.login).toBeDefined();
    const decodedToken = jwt.verify(resp.data.login, process.env.ACCESS_TOKEN_SECRET);
    expect(decodedToken).toBeTruthy();

    const user = await User.findOne({
      email: "user3@stan.com"
    });

    expect(user).toBeTruthy();
    expect(decodedToken.userId).toBe(user.id);
    expect(decodedToken.tokenVersion).toBe(0);
  });

  it("should not login a user with the wrong password", async () => {
    await signUserUp("Stan3", "user3@stan.com", "12345678");

    const resp = await mutate({
      query: LOGIN_MUTATION,
      variables: {
        email: "user3@stan.com",
        password: "wrong password"
      }
    });

    expect(resp.data).toBeFalsy();
  });

  it("should not login a non existing user", async () => {
    const resp = await mutate({
      query: LOGIN_MUTATION,
      variables: {
        email: "notAUser@stan.com",
        password: "12345678"
      }
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("User with this email does not exist.");
  });

  it("should fetch the current user - which is null", async () => {
    const resp = await query({
      query: CURRENT_USER
    });
    expect(resp.data.currentUser).toBeFalsy();
    expect(resp.data.currentUser).toBe(null);
  });

  async function signUserUp(username, email, password, mascot) {
    const initialCount = await User.countDocuments();
    const resp = await mutate({
      query: SIGNUP_MUTATION,
      variables: {
        username,
        email,
        password,
        mascot: mascot || 0,
        allowEmailNotifications: false
      }
    });
    expect(resp.data.signup).toBeTruthy();
    const newCount = await User.countDocuments();
    expect(newCount).toBe(initialCount + 1);
    return resp;
  }

  it("should not log the user out - user isn't logged in", async () => {
    const resp = await mutate({
      query: LOGOUT_MUTATION
    });

    expect(resp.data.logout).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Unauthorised");
  });

  it("should refuse invalid google login token", async () => {
    const resp = await mutate({
      query: GOOGLE_LOGIN_MUTATION,
      variables: {
        idToken: "notAValidGoogleToken"
      }
    });

    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Google id token was not verified. Please try again.");
  });
});
