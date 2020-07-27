//https://www.apollographql.com/docs/apollo-server/testing/testing/
//https://mongoosejs.com/docs/jest.html
import "dotenv/config";
import { createTestClient } from "apollo-server-testing";
import { setupApolloServer, setupDb, signUpTestUser, clearDatabase, teardown } from "../setup";
import {
  LOGIN_MUTATION,
  SIGNUP_MUTATION,
  UPDATE_MASCOT_MUTATION,
  LOGOUT_MUTATION,
  FORGOTTEN_PASSWORD_EMAIL,
  RESET_PASSWORD_MUTATION
} from "../../mutations.js";
import { CURRENT_USER } from "../../queries.js";
import { User } from "../../../models";
import { createAccessToken } from "../../../helpers/authentication/authenticationTokens";
import jwt from "jsonwebtoken";
import { isAuth } from "../../../helpers/authentication/is-auth";

describe("Test resolvers are accessed correctly when authenticated", () => {
  let server;
  let mutate;
  let query;
  let testUser;
  let client;
  beforeAll(async () => {
    await setupDb();
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

  // afterEach(async () => {
  // });

  afterAll(async () => {
    await clearDatabase();
    await teardown();
  });

  /** TESTUSER:
      {
        googleId: '',
        mascot: 1,
        accessTokenVersion: 0,
        refreshTokenVersion: 0,
        googleLogin: false,
        createdAt: 2020-04-07T13:39:55.593Z,
        _id: 5e8c82acb053b0c3482a8886,
        username: 'Samantha',
        email: 'samantha@stan.com',
        password: '$2b$10$zxgEwVDhvnkNc2nQsmjhjOGQXb9bRXfVOm/qAAvjZwRPmCRwBf3u2',
        __v: 0
      }
     */

  it("should fetch the current logged in user", async () => {
    const resp = await query({
      query: CURRENT_USER
    });

    expect(resp.data.currentUser).toBeTruthy();
    expect(resp.data.currentUser.id.toString()).toBe(testUser._id.toString());
    expect(resp.data.currentUser.username).toBe(testUser.username);
    expect(resp.data.currentUser.email).toBe(testUser.email);
    expect(resp.data.currentUser.mascot).toBe(testUser.mascot);
    expect(resp.data.currentUser.googleLogin).toBe(testUser.googleLogin);
  });

  it("should update the mascot for a user", async () => {
    const resp = await mutate({
      query: UPDATE_MASCOT_MUTATION,
      variables: {
        mascot: 2
      }
    });
    expect(resp.data.updateMascot).toBeTruthy();

    const user = await User.findOne({
      username: testUser.username,
      email: testUser.email
    });
    expect(user).toBeTruthy();
    expect(user.mascot).toBe(2);

    const resp2 = await mutate({
      query: UPDATE_MASCOT_MUTATION,
      variables: {
        mascot: 5
      }
    });
    expect(resp2.data.updateMascot).toBeFalsy();
    expect(resp2.errors[0].message).toEqual(
      "Mascot input has the wrong format. It must be one of the following numbers: 0, 1, 2."
    );
  });

  it("should not sign up or login a user if already logged in", async () => {
    //Already logged in
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

    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Already logged in.");

    //Already logged in
    const resp2 = await mutate({
      query: LOGIN_MUTATION,
      variables: {
        email: "samantha@stan.com",
        password: "samantha"
      }
    });
    expect(resp2.data).toBeFalsy();
    expect(resp2.errors[0].message).toEqual("Already logged in.");
  });

  it("should access forgotten or reset password", async () => {
    //Already logged in
    let resp = await mutate({
      query: FORGOTTEN_PASSWORD_EMAIL,
      variables: {
        email: "user@stan.com"
      }
    });

    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Already logged in.");

    resp = await mutate({
      query: RESET_PASSWORD_MUTATION,
      variables: {
        userId: "doesnotmatter",
        token: "alsodoesnotmatter",
        newPassword: "alsoreallydoesntmater"
      }
    });

    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Already logged in.");
  });

  it("should log the user out", async () => {
    expect(testUser.accessTokenVersion).toBe(0);
    expect(testUser.refreshTokenVersion).toBe(0);
    const accessToken = createAccessToken(testUser._id, testUser.accessTokenVersion);
    expect(accessToken).toBeTruthy();
    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    expect(decodedToken).toBeTruthy();
    expect(decodedToken.userId).toBe(testUser.id);
    expect(decodedToken.tokenVersion).toBe(0);
    const headers = new Map();
    headers.set("Authorization", "bearer " + accessToken);
    const isAuthResp = await isAuth(headers);
    expect(isAuthResp).toBeTruthy();

    //Already logged in
    const resp = await mutate({
      query: LOGOUT_MUTATION
    });
    expect(resp.data.logout).toBeTruthy();

    const user = await User.findOne({
      _id: testUser._id
    });

    expect(user.accessTokenVersion).toBe(1);
    expect(user.refreshTokenVersion).toBe(1);

    const headers2 = new Map();
    headers2.set("Authorization", "bearer " + accessToken);
    let isAuthResp2;

    isAuthResp2 = await isAuth(headers2);
    expect(isAuthResp2).toBeTruthy();
    expect(isAuthResp2.isAuth).toBeFalsy();
  });
});
