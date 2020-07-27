import { User } from "../../models";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { verifyEmailFormat, verifyUpdatePasswordInputFormat } from "./validateUserInput";
import { invalidationAuthenticationTokens } from "../authentication/authenticationTokens";
import StanEmail from "../StanEmail";

export async function handleForgottenPasswordEmail(email) {
  verifyEmailFormat(email);
  const link = await createForgottenPasswordLink(email);
  const stanEmail = new StanEmail();
  stanEmail.sendForgottenPasswordMail(email, link);
}

export async function createForgottenPasswordLink(email) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("There is no user with that email address.");
  const secret = createForgottenPasswordSecret(user);
  const token = jwt.sign({ userId: user._id, userEmail: email }, secret, {
    expiresIn: "10m"
  });
  return `${process.env.CLIENT_URL}/resetpassword/${user._id}/${token}`;
}

export function createForgottenPasswordSecret(user) {
  return user.password + "-" + user.updatedAt.getTime() + process.env.FORGOTTEN_PASSWORD_SECRET;
}

//--------Reset password--------
export async function handleResetPassword({ userId, token, newPassword }) {
  const user = await User.findOne({ _id: userId });
  if (!user) throw new Error("There is no user with that id.");

  const secret = createForgottenPasswordSecret(user);
  validateForgottenPasswordToken(user, token, secret);
  verifyUpdatePasswordInputFormat(newPassword);
  const passwordToSave = await bcrypt.hash(newPassword, 10);
  await updatePassword(user._id, passwordToSave);
  await invalidationAuthenticationTokens(userId);
}

export function validateForgottenPasswordToken(user, token, secret) {
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, secret);
    if (!decodedToken) throw new Error();
  } catch (err) {
    throw new Error("Invalid url. Please use the forgotten password button to try again.");
  }
  if (decodedToken.userId.toString() !== user._id.toString())
    throw new Error(
      "Invalid url. Please use the forgotten password button to try again. Wrong user in the forgotten password token."
    );

  if (decodedToken.userEmail !== user.email)
    throw new Error(
      "Invalid url. Please use the forgotten password button to try again. Wrong user email in the forgotten password token."
    );
}

export async function updatePassword(userId, password) {
  const updateResp = await User.updateOne({ _id: userId }, { password, updatedAt: new Date() });
  if (updateResp.ok === 0) throw new Error("Unable to reset the password. Please try again.");
}
