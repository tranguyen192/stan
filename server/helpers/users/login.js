import { createLoginTokens } from "../authentication/authenticationTokens";

import { validatePassword, verifyLoginInputFormat } from "./validateUserInput";

import {
  // UserInputError,
  AuthenticationError
} from "apollo-server";

import { User } from "../../models";

export async function handleLogin({ email, password }, res) {
  verifyLoginInputFormat({ email, password });
  const user = await authenticateUser({ email, password });
  return createLoginTokens({ user, res });
}

export async function authenticateUser({ email, password }) {
  const user = await User.findOne({ email: email });
  if (!user) throw new AuthenticationError("User with this email does not exist.");

  //in case user tries to login with google login data in normal login - cause no password!
  if (user.googleLogin) throw new AuthenticationError("User has to login with google.");
  await validatePassword(password, user.password);
  return user;
}
