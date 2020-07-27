import { User } from "../../models";
import bcrypt from "bcrypt";
import {
  validatePassword,
  verifyUpdatePasswordInputFormat,
  verifyMascotFormat,
  verifyUpdateUserInputFormat
} from "./validateUserInput";
import { verifyEmailIsUnique } from "./userHelpers";

export async function handleUpdateMascot(mascot, userInfo) {
  verifyMascotFormat(mascot);
  if (userInfo.user.mascot === mascot) return true;
  const resp = await User.updateOne({ _id: userInfo.userId }, { mascot, updatedAt: new Date() });
  if (resp.ok === 0) throw new Error("The mascot couldn't be updated.");
}

export async function handleUpdateUser(args, userInfo) {
  if (userInfo.user.googleLogin) throw new Error("Cannot update Google Login user account.");
  verifyUpdateUserInputFormat({ ...args });
  return await updateUser({
    userId: userInfo.userId,
    currentUser: userInfo.user,
    ...args
  });
}

async function updateUser(args) {
  if (args.email !== args.currentUser.email) await verifyEmailIsUnique(args.email);
  let passwordToSave = await getPasswordToSave(
    args.currentUser.password,
    args.password,
    args.newPassword
  );
  const resp = await User.updateOne(
    { _id: args.userId.toString() },
    {
      username: args.username,
      email: args.email,
      password: passwordToSave,
      mascot: args.mascot,
      allowEmailNotifications: args.allowEmailNotifications,
      updatedAt: new Date()
    }
  );

  if (resp.ok === 0) throw new Error("The user couldn't be updated.");

  return await User.findOne({
    _id: args.userId
  });
}

export function userWantsPasswordUpdating(password, newPassword) {
  return (password && password.length > 0) || (newPassword && newPassword.length > 0);
}

async function getPasswordToSave(currentPassword, inputOldPassword, inputNewPassword) {
  if (userWantsPasswordUpdating(inputOldPassword, inputNewPassword)) {
    await validatePassword(inputOldPassword, currentPassword);
    verifyUpdatePasswordInputFormat(inputNewPassword);
    return await bcrypt.hash(inputNewPassword, 10);
  }
  return currentPassword;
}
