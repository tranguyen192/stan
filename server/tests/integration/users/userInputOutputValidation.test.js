//https://www.apollographql.com/docs/apollo-server/testing/testing/
//https://mongoosejs.com/docs/jest.html
import "dotenv/config";
import { createTestClient } from "apollo-server-testing";
import { setupApolloServer, setupDb, signUpTestUser, clearDatabase, teardown } from "../setup";
import { LOGIN_MUTATION, SIGNUP_MUTATION, UPDATE_USER_MUTATION } from "../../mutations.js";
import { CURRENT_USER } from "../../queries.js";

describe("Test user resolver input (regex) and output (escape)", () => {
  let server;
  let mutate;
  let query;
  beforeAll(async () => {
    await setupDb();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await teardown();
  });

  it("should pass the regex tests and sign up a user", async () => {
    server = await setupApolloServer({ isAuth: false });
    let client = createTestClient(server);
    mutate = client.mutate;
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
  });

  it("should use regex to filter out wrong username format", async () => {
    const resp = await mutate({
      query: SIGNUP_MUTATION,
      variables: {
        username: "",
        email: "user2@stan.com",
        password: "12345678",
        mascot: 1,
        allowEmailNotifications: true
      }
    });

    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "Username input has the wrong format. It cannot be empty. Max length 30 characters."
    );
  });

  it("should use regex to filter out wrong email format", async () => {
    const resp = await mutate({
      query: SIGNUP_MUTATION,
      variables: {
        username: "Stan",
        email: "userstan.com",
        password: "12345678",
        mascot: 1,
        allowEmailNotifications: true
      }
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Email input has the wrong format.");
  });

  it("should use regex to filter out wrong email format", async () => {
    const resp = await mutate({
      query: SIGNUP_MUTATION,
      variables: {
        username: "Stan",
        email: "",
        password: "12345678",
        mascot: 1,
        allowEmailNotifications: true
      }
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Email input has the wrong format.");
  });

  it("should use regex to filter out wrong email format", async () => {
    const resp = await mutate({
      query: SIGNUP_MUTATION,
      variables: {
        username: "Stan",
        email: "A@b@c@stan.com",
        password: "12345678",
        mascot: 1,
        allowEmailNotifications: true
      }
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Email input has the wrong format.");
  });

  it("should use regex to filter out wrong password format", async () => {
    const resp = await mutate({
      query: SIGNUP_MUTATION,
      variables: {
        username: "Stan",
        email: "user3@stan.com",
        password: "",
        mascot: 1,
        allowEmailNotifications: true
      }
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "Password input has the wrong format. It must contain at least 8 characters. Max length 30 characters."
    );
  });

  it("should use regex to filter out wrong mascot format", async () => {
    const resp = await mutate({
      query: SIGNUP_MUTATION,
      variables: {
        username: "Stan",
        email: "user3@stan.com",
        password: "12345678",
        mascot: 5,
        allowEmailNotifications: true
      }
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "Mascot input has the wrong format. It must be one of the following numbers: 0, 1, 2."
    );
  });

  it("should pass the regex tests and login a user", async () => {
    const respSignup = await mutate({
      query: SIGNUP_MUTATION,
      variables: {
        username: "Stan",
        email: "user@stan.com",
        password: "12345678",
        mascot: 1,
        allowEmailNotifications: false
      }
    });
    expect(respSignup.data.signup).toBeTruthy();

    const resp = await mutate({
      query: LOGIN_MUTATION,
      variables: {
        email: "user@stan.com",
        password: "12345678"
      }
    });
    expect(resp.data.login).toBeTruthy();
  });

  it("should use regex to filter out wrong email format", async () => {
    const resp = await mutate({
      query: LOGIN_MUTATION,
      variables: {
        email: "userstan.com",
        password: "12345678"
      }
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Email input has the wrong format.");
  });

  it("should use regex to filter out wrong email format", async () => {
    const resp = await mutate({
      query: LOGIN_MUTATION,
      variables: {
        email: "",
        password: "12345678"
      }
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual("Email input has the wrong format.");
  });

  it("should use regex to filter out wrong password format", async () => {
    const resp = await mutate({
      query: LOGIN_MUTATION,
      variables: {
        email: "user@stan.com",
        password: "1234567"
      }
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "Password input has the wrong format. It must contain at least 8 characters. Max length 30 characters."
    );
  });

  it("should use regex to filter out wrong password format", async () => {
    const resp = await mutate({
      query: LOGIN_MUTATION,
      variables: {
        email: "user@stan.com",
        password: ""
      }
    });
    expect(resp.data).toBeFalsy();
    expect(resp.errors[0].message).toEqual(
      "Password input has the wrong format. It must contain at least 8 characters. Max length 30 characters."
    );
  });

  it("should escape all output strings that came from user input", async () => {
    let testUser = await signUpTestUser();
    testUser.username = "<script>alert('I'm an evil user')</script>";
    server = await setupApolloServer({
      isAuth: true,
      userId: testUser._id,
      user: testUser
    });
    let client = createTestClient(server);
    mutate = client.mutate;
    query = client.query;

    //---get current user---
    const respCurrentUser = await query({
      query: CURRENT_USER
    });
    expect(respCurrentUser.data.currentUser).toBeTruthy();
    expect(respCurrentUser.data.currentUser.username).toBe(
      "&lt;script&gt;alert(&#x27;I&#x27;m an evil user&#x27;)&lt;&#x2F;script&gt;"
    );

    //---get current user---
    const respUpdateUser = await mutate({
      query: UPDATE_USER_MUTATION,
      variables: {
        username: "Samantha's new username",
        email: "newSamantha@node.com",
        password: "samantha",
        newPassword: "12345678",
        mascot: 2,
        allowEmailNotifications: true
      }
    });
    expect(respUpdateUser.data.updateUser).toBeTruthy();
    expect(respUpdateUser.data.updateUser.username).toBe("Samantha&#x27;s new username");
  });
});
