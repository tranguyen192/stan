import validator from "validator";
import { AuthenticationError, UserInputError, ApolloError } from "apollo-server";

export function handleResolverError(err) {
  if (err.extensions && err.extensions.code && err.extensions.code === "UNAUTHENTICATED")
    throw new AuthenticationError(err.message);
  if (err.extensions && err.extensions.code && err.extensions.code === "BAD_USER_INPUT")
    throw new UserInputError(err.message);

  throw new ApolloError(err.message);
}

export function handleAuthentication(userInfo) {
  if (!userInfo.isAuth) throw new AuthenticationError("Unauthorised");
}
export function handleAuthenticationAlreadyLoggedIn(userInfo) {
  if (userInfo.isAuth) throw new AuthenticationError("Already logged in.");
}

export function escapeObjectForHtml(unescapedObject) {
  const escapedObject = { ...unescapedObject };
  for (var key in escapedObject) {
    if (typeof escapedObject[key] === "string" || escapedObject[key] instanceof String)
      escapedObject[key] = escapeStringForHtml(escapedObject[key]);
    else if (Array.isArray(escapedObject[key])) {
      escapedObject[key] = escapeArrayForHtml(escapedObject[key]);
    }
  }
  return escapedObject;
}

export function escapeArrayForHtml(unescapedArray) {
  for (let i = 0; i < unescapedArray.length; i++) {
    unescapedArray[i] = escapeStringForHtml(unescapedArray[i]);
  }
  return unescapedArray;
}

export function escapeStringForHtml(value) {
  if (typeof value === "string" || value instanceof String) return validator.escape(value);
  else return value;
}

export function removeWhitespace(string) {
  if (typeof string !== "string") throw new Error("Can only remove whitespace of type string.");
  return string.replace(/\s/g, "");
}
