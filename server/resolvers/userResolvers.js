// UserInputError,
import { ApolloError } from "apollo-server";
import {
  handleResolverError,
  handleAuthentication,
  handleAuthenticationAlreadyLoggedIn
} from "../helpers/generalHelpers";
import { escapeUserObject, updateUserLastVisited } from "../helpers/users/userHelpers";
import { handleUpdateUser, handleUpdateMascot } from "../helpers/users/updateUser";
import {
  handleForgottenPasswordEmail,
  handleResetPassword
} from "../helpers/users/forgottenResetPassword";
import { handleDeleteUser } from "../helpers/users/deleteUser";
import { handleSignUp } from "../helpers/users/signup";
import { handleGoogleLogin } from "../helpers/users/googleLogin";
import { handleLogin } from "../helpers/users/login";
import { logUserOut } from "../helpers/users/logout";

export const userResolvers = {
  Query: {
    currentUser: async (_, __, { userInfo }) => {
      try {
        if (!userInfo.isAuth) return null;
        updateUserLastVisited(userInfo.userId);
        return escapeUserObject(userInfo.user);
      } catch (err) {
        console.error(err.message);
        return null;
      }
    }
  },
  Mutation: {
    logout: async (_, __, { res, userInfo }) => {
      try {
        handleAuthentication(userInfo);
        await logUserOut(res, userInfo.userId);
      } catch (err) {
        throw new ApolloError(err.message);
      }
      return true;
    },
    login: async (_, args, { res, userInfo }) => {
      try {
        handleAuthenticationAlreadyLoggedIn(userInfo);
        return await handleLogin({ ...args }, res);
      } catch (err) {
        handleResolverError(err);
      }
    },
    signup: async (_, args, { res, userInfo }) => {
      try {
        handleAuthenticationAlreadyLoggedIn(userInfo);
        return handleSignUp(args, res);
      } catch (err) {
        handleResolverError(err);
      }
    },
    updateMascot: async (_, { mascot }, { userInfo }) => {
      try {
        handleAuthentication(userInfo);
        await handleUpdateMascot(mascot, userInfo);
        return true;
      } catch (err) {
        handleResolverError(err);
      }
    },
    googleLogin: async (_, { idToken }, { res, userInfo }) => {
      //https://developers.google.com/identity/sign-in/web/backend-auth
      try {
        handleAuthenticationAlreadyLoggedIn(userInfo);
        return await handleGoogleLogin(idToken, res);
      } catch (err) {
        handleResolverError(err);
      }
    },
    updateUser: async (_, args, { userInfo }) => {
      try {
        handleAuthentication(userInfo);
        const updatedUser = await handleUpdateUser(args, userInfo);
        return escapeUserObject(updatedUser);
      } catch (err) {
        handleResolverError(err);
      }
    },
    forgottenPasswordEmail: async (_, { email }, { userInfo }) => {
      try {
        handleAuthenticationAlreadyLoggedIn(userInfo);
        await handleForgottenPasswordEmail(email);
        return true;
      } catch (err) {
        handleResolverError(err);
      }
    },
    resetPassword: async (_, args, { userInfo }) => {
      try {
        handleAuthenticationAlreadyLoggedIn(userInfo);
        await handleResetPassword(args);
        return true;
      } catch (err) {
        handleResolverError(err);
      }
    },
    deleteUser: async (_, __, { res, userInfo }) => {
      try {
        handleAuthentication(userInfo);
        await handleDeleteUser(res, userInfo);
        return true;
      } catch (err) {
        handleResolverError(err);
      }
    }
  }
};
