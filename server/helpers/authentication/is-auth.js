import jwt from "jsonwebtoken";
import { User } from "../../models";
import { AuthenticationError } from "apollo-server";

export async function isAuth(req) {
  try {
    const decodedToken = decodeAccessToken(req);
    const user = await User.findOne({ _id: decodedToken.userId });
    if (!user) throw new AuthenticationError("User does not exist.");
    if (user.accessTokenVersion !== decodedToken.tokenVersion)
      throw new AuthenticationError("Wrong token version.");
    return { isAuth: true, userId: decodedToken.userId, user };
  } catch (err) {
    return { isAuth: false, userId: "" };
  }
}

function decodeAccessToken(req) {
  const authHeader = req.get("Authorization");
  if (!authHeader) throw new AuthenticationError("Unauthorised"); //executes next function (if there is one)
  const token = authHeader.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  if (!decodedToken) throw new Error("Invalid access token.");
  return decodedToken;
}
