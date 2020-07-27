import { User } from "../../models";
import { escapeStringForHtml } from "../generalHelpers";
import { UserInputError } from "apollo-server";

export async function updateUserLastVisited(userId) {
  await User.updateOne(
    { _id: userId },
    {
      lastVisited: new Date(),
      sentOneMonthDeleteReminder: false,
      updatedAt: new Date()
    }
  );
}

export function escapeUserObject(user) {
  user.username = escapeStringForHtml(user.username);
  user.email = escapeStringForHtml(user.email);
  return user;
}

export async function verifyEmailIsUnique(email) {
  const userWithEmail = await User.findOne({ email: email });
  if (userWithEmail)
    throw new UserInputError("User with email already exists, choose another one.");
}
