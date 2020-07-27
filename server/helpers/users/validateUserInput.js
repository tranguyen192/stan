import {
  verifyRegexEmail,
  verifyRegexUsername,
  verifyRegexPassword,
  verifyRegexMascot
} from "../verifyInput";

import validator from "validator";

import { UserInputError, AuthenticationError } from "apollo-server";

import bcrypt from "bcrypt";

export async function validatePassword(inputPassword, userPassword) {
  try {
    if (!verifyRegexPassword(inputPassword)) throw new Error();
    const valid = await bcrypt.compare(inputPassword, userPassword);
    if (!valid) throw new Error();
  } catch (err) {
    throw new AuthenticationError("Password is incorrect.");
  }
}

export function verifySignupInputFormat({ username, email, password, mascot }) {
  verifyUsernameFormat(username);
  verifyEmailFormat(email);
  verifyPasswordFormat(password);
  verifyMascotFormat(mascot);
}

export function verifyUpdateUserInputFormat({ username, email, mascot }) {
  verifyUsernameFormat(username);
  verifyEmailFormat(email);
  verifyMascotFormat(mascot);
}

export function verifyUpdatePasswordInputFormat(password) {
  try {
    verifyPasswordFormat(password);
  } catch (err) {
    throw new UserInputError(
      "New password input has the wrong format. It must contain at least 8 characters. Max length 30 characters."
    );
  }
}

export function verifyLoginInputFormat({ email, password }) {
  verifyEmailFormat(email);
  verifyPasswordFormat(password);
}

// export function verifyMascotInputFormat({ mascot }) {
//   verifyMascotFormat(mascot);
// }

function verifyUsernameFormat(username) {
  if (!verifyRegexUsername(username))
    throw new UserInputError(
      "Username input has the wrong format. It cannot be empty. Max length 30 characters."
    );
}

export function verifyEmailFormat(email) {
  if (!verifyRegexEmail(email) || !validator.isEmail(email))
    throw new UserInputError("Email input has the wrong format.");
}

export function verifyPasswordFormat(password) {
  if (!verifyRegexPassword(password))
    throw new UserInputError(
      "Password input has the wrong format. It must contain at least 8 characters. Max length 30 characters."
    );
}

export function verifyMascotFormat(mascot) {
  if (!verifyRegexMascot(mascot.toString()))
    throw new UserInputError(
      "Mascot input has the wrong format. It must be one of the following numbers: 0, 1, 2."
    );
}
