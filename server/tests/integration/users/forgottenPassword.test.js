//https://www.apollographql.com/docs/apollo-server/testing/testing/
//https://mongoosejs.com/docs/jest.html
import "dotenv/config";
import { createTestClient } from "apollo-server-testing";
import { setupApolloServer, setupDb, signUpTestUser, clearDatabase, teardown } from "../setup";
import { RESET_PASSWORD_MUTATION } from "../../mutations.js";
// import { FORGOTTEN_PASSWORD_EMAIL } from "../../queries.js";
import jwt from "jsonwebtoken";

import { User } from "../../../models";
import {
  createForgottenPasswordLink,
  createForgottenPasswordSecret
} from "../../../helpers/users/forgottenResetPassword";
import bcrypt from "bcrypt";

describe("Test forgotten password resolver/helpers", () => {
  let server;

  let query;

  let testUser;
  let client;

  beforeAll(async () => {
    await setupDb();
  });
  beforeEach(async () => {
    testUser = await signUpTestUser();
    server = await setupApolloServer({
      isAuth: false
    });

    client = createTestClient(server);

    query = client.query;
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await teardown();
  });

  it.only("should update the users password correctly", async () => {
    //---create the email link---
    const secret = createForgottenPasswordSecret(testUser);
    const token = jwt.sign({ userId: testUser._id, userEmail: testUser.email }, secret, {
      expiresIn: "10m"
    });

    const link = await createForgottenPasswordLink(testUser.email);
    expect(link).toBeTruthy();
    expect(link).toBe(process.env.CLIENT_URL + "/resetpassword/" + testUser._id + "/" + token);

    //---reset password---
    const userBeforePasswordReset = await User.findOne({ _id: testUser._id });
    expect(userBeforePasswordReset).toBeTruthy();

    expect(await bcrypt.compare("samantha", userBeforePasswordReset.password)).toBeTruthy();

    //should detect if password format is wrong
    let respResetPassword = await query({
      query: RESET_PASSWORD_MUTATION,
      variables: {
        userId: testUser._id.toString(),
        token,
        newPassword: "bad"
      }
    });

    expect(respResetPassword.data).toBeFalsy();
    expect(respResetPassword.errors[0].message).toEqual(
      "New password input has the wrong format. It must contain at least 8 characters. Max length 30 characters."
    );

    //should reset password
    respResetPassword = await query({
      query: RESET_PASSWORD_MUTATION,
      variables: {
        userId: testUser._id.toString(),
        token,
        newPassword: "myNewEvenMoreSecretPassword"
      }
    });

    expect(respResetPassword).toBeTruthy();
    const userAfterPasswordReset = await User.findOne({ _id: testUser._id });

    expect(
      await bcrypt.compare("myNewEvenMoreSecretPassword", userAfterPasswordReset.password)
    ).toBeTruthy();

    expect(await bcrypt.compare("samantha", userAfterPasswordReset.password)).toBeFalsy();
    expect(
      await bcrypt.compare(userBeforePasswordReset.password, userAfterPasswordReset.password)
    ).toBeFalsy();
    expect(await bcrypt.compare("samantha", userAfterPasswordReset.password)).toBeFalsy();
  });
});
