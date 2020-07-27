import { createLoginTokens } from "../authentication/authenticationTokens";
import { AuthenticationError } from "apollo-server";
import { User } from "../../models";
import { OAuth2Client } from "google-auth-library";
import { signUserUp } from "./signup";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function handleGoogleLogin(idToken, res) {
  const payload = await verifyGoogleIdToken(idToken);
  let user = await User.findOne({ googleId: payload.sub });
  if (!user) user = await signUpGoogleUser(payload);
  return createLoginTokens({ user, res });
}

//source: https://developers.google.com/identity/sign-in/web/backend-auth
export async function verifyGoogleIdToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error();
    return payload;
  } catch (err) {
    throw new AuthenticationError("Google id token was not verified. Please try again.");
  }
}

export function signUpGoogleUser(payload) {
  return signUserUp({
    username: payload.name,
    email: payload.email,
    password: null,
    googleId: payload.sub,
    googleLogin: true
  });
}
