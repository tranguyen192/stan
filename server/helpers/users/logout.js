import {
  sendRefreshToken,
  invalidationAuthenticationTokens
} from "../authentication/authenticationTokens";

export async function logUserOut(res, userId) {
  sendRefreshToken(res, "");
  //invalidate current refresh tokens for user
  await invalidationAuthenticationTokens(userId);
}
