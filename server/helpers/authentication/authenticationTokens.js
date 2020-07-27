import jwt from "jsonwebtoken";
import { User } from "../../models/index";
import { handleResolverError } from "../generalHelpers";

export function createLoginTokens({ user, res }) {
  let userAccessToken = createAccessToken(user.id, user.accessTokenVersion);
  sendRefreshToken(res, createRefreshToken(user.id, user.refreshTokenVersion));
  return userAccessToken;
}

export const sendRefreshToken = (res, token) => {
  if (res)
    res.cookie("refresh_token", token, {
      httpOnly: true,
      path: "/refresh_token" //to only send request token when at refresh_token path,
      // secure: true
      // sameSite: "strict"
    });
};

export const createAccessToken = (userId, tokenVersion) => {
  if (!userId || isNaN(tokenVersion))
    throw new Error("No user id or access token version, cannot create access token.");
  return jwt.sign({ userId, tokenVersion }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m"
  });
};

export const createRefreshToken = (userId, tokenVersion) => {
  if (!userId || isNaN(tokenVersion))
    throw new Error("No user id or refresh token version, cannot create refresh token.");
  return jwt.sign({ userId, tokenVersion }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d"
  });
};

//----------REFRESH TOKEN ROUTE----------
export async function handleRefreshTokenRoute(req, res) {
  //read refresh cookie - validate that it's correct
  try {
    const payload = verifyRefreshToken(req);
    const user = await getUserFromToken(payload);
    sendRefreshToken(res, createRefreshToken(user.id, user.refreshTokenVersion));
    return res.send({ ok: true, accessToken: createAccessToken(user.id, user.accessTokenVersion) });
  } catch (err) {
    console.error("Error in handleRefreshTokenRoute(): " + err.message);
    return res.send({ ok: false, accessToken: "" });
  }
}

function verifyRefreshToken(req) {
  const token = req.cookies.refresh_token;
  if (!token) throw new Error("No refresh token in cookie");
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

async function getUserFromToken(payload) {
  const user = await User.findOne({ _id: payload.userId });
  if (!user) throw new Error("No refresh token in cookie");
  if (user.refreshTokenVersion !== payload.tokenVersion)
    throw new Error("No refresh token in cookie");
  return user;
}

export async function invalidationAuthenticationTokens(userId) {
  const respRefreshToken = await invalidateRefreshTokens(userId);
  if (!respRefreshToken) throw new Error("Unable to revoke refresh token.");
  const respAccessToken = await invalidateAccessTokens(userId);
  if (!respAccessToken) throw new Error("Unable to revoke access token.");
}

async function invalidateRefreshTokens(userId) {
  try {
    const resp = await User.updateOne(
      { _id: userId },
      { $inc: { refreshTokenVersion: 1 }, updatedAt: new Date() }
    );
    if (resp.nModified === 0) throw new Error("Refresh token version was not increased.");

    return true;
  } catch (err) {
    handleResolverError(err);
  }
}

async function invalidateAccessTokens(userId) {
  try {
    const resp = await User.updateOne(
      { _id: userId },
      { $inc: { accessTokenVersion: 1 }, updatedAt: new Date() }
    );
    if (resp.nModified === 0) throw new Error("Access token version was not increased.");

    return true;
  } catch (err) {
    handleResolverError(err);
  }
}
