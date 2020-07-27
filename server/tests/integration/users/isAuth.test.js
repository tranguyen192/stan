import { createAccessToken } from "../../../helpers/authentication/authenticationTokens";
import { isAuth } from "../../../helpers/authentication/is-auth";
import "dotenv/config";
import jwt from "jsonwebtoken";

import { setupApolloServer, setupDb, signUpTestUser, clearDatabase, teardown } from "../setup";

describe("Test is auth (verifies access token and authenticates that user)", () => {
  let testUser;

  beforeAll(async () => {
    await setupDb();
    testUser = await signUpTestUser();
    await setupApolloServer({ isAuth: false });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await teardown();
  });

  it("authorise the test User", async () => {
    const headers = new Map();
    const user = { id: testUser._id, accessTokenVersion: 0 };
    const accessToken = createAccessToken(user.id, user.accessTokenVersion);
    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    expect(decodedToken).toBeTruthy();
    headers.set("Authorization", "bearer " + accessToken);
    const resp = await isAuth(headers);
    expect(resp).toBeTruthy();
    expect(resp.isAuth).toBeTruthy();
    expect(resp.userId).toBe(testUser._id.toString());
    expect(resp.user).toBeTruthy();
    expect(resp.user.id.toString()).toBe(testUser._id.toString());
    expect(resp.user.username).toBe(testUser.username);
    expect(resp.user.email).toBe(testUser.email);
    expect(resp.user.mascot).toBe(testUser.mascot);
    expect(resp.user.googleLogin).toBe(testUser.googleLogin);
    expect(true).toBeTruthy();
  });

  it("should return false, since the user does not exist", async () => {
    const headers = new Map();

    const user = { id: "wrongId", accessTokenVersion: 0 };
    const accessToken = createAccessToken(user.id, user.accessTokenVersion);
    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    expect(decodedToken).toBeTruthy();

    headers.set("Authorization", "bearer " + accessToken);
    const resp = await isAuth(headers);

    expect(resp).toBeTruthy();
    expect(resp.isAuth).toBeFalsy();
  });

  it("should return false, invalid access token", async () => {
    const headers = new Map();
    headers.set("Authorization", "bearer " + "made up token");
    const resp = await isAuth(headers);
    expect(resp).toBeTruthy();
    expect(resp.isAuth).toBeFalsy();
  });
});
