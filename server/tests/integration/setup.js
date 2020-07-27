// import { createTestClient } from "apollo-server-testing";
import { typeDefs } from "../../typedefs";
import { resolvers } from "../../resolvers";
import { ApolloServer } from "apollo-server-express"; //UserInputError
import { MongoMemoryServer } from "mongodb-memory-server";
import { User, Exam } from "../../models";
import bcrypt from "bcrypt";
import { getNumberOfDays } from "../../helpers/dates";

import mongoose from "mongoose";

let mongod;

export async function setupApolloServer({ isAuth, userId, user }) {
  let server;

  try {
    server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async () => ({
        req: {},
        res: {
          cookie: (name, value, options) => {
            return { name, value, options };
          }
        },

        userInfo: { isAuth, userId, user }
      })
    });
  } catch (err) {
    throw new Error("Apollo server not connected.");
  }
  return server;
}

export async function setupDb() {
  try {
    mongod = new MongoMemoryServer();
    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
  } catch (err) {
    throw new Error("DB not connected.");
  }
}

/** 
      {
        googleId: '',
        mascot: 1,
        tokenVersion: 0,
        googleLogin: false,
        createdAt: 2020-04-07T13:39:55.593Z,
        _id: 5e8c82acb053b0c3482a8886,
        username: 'Samantha',
        email: 'samantha@stan.com',
        password: '$2b$10$zxgEwVDhvnkNc2nQsmjhjOGQXb9bRXfVOm/qAAvjZwRPmCRwBf3u2',
        __v: 0
      }
     */

export async function signUpTestUser(email) {
  const hashedPassword = await bcrypt.hash("samantha", 10);
  const user = await User.create({
    username: "Samantha",
    email: email || "samantha@stan.com",
    password: hashedPassword,
    mascot: 1,
    googleId: "",
    googleLogin: false,
    allowEmailNotifications: false
  });

  if (!user) throw new Error("Could not sign up a test user");

  return user;
}

export async function addTestExam({
  subject = "Biology",
  examDate,
  startDate,
  startPage = 1,
  lastPage = 50,
  timePerPage = 5,
  currentPage,
  timesRepeat = 1,
  color = "#FFFFFF",
  userId = "samanthasId",
  notes = "Samantha's notes",
  completed = false
}) {
  let numberPages = lastPage - startPage + 1;
  if (lastPage <= startPage) throw new Error("The last page should be higher than the start page.");

  const finalExamDate = examDate || getFutureDay(new Date(), 5);
  const finalStartDate = startDate || new Date();
  const totalNumberDays = getNumberOfDays(finalStartDate, finalExamDate);
  const exam = await Exam.create({
    subject: subject,
    examDate: finalExamDate,
    startDate: finalStartDate,
    totalNumberDays,
    startPage,
    lastPage,
    numberPages,
    timePerPage,
    currentPage: currentPage || startPage || 1,
    timesRepeat,
    notes,
    studyMaterialLinks: [
      "https://stan-studyplan-staging.herokuapp.com/",
      "https://stan-studyplan.herokuapp.com/"
    ],
    color,
    userId,
    completed
  });

  if (!exam) throw new Error("Could not add a test exam");

  return exam;
}

export function getFutureDay(date, numberDaysInFuture) {
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + numberDaysInFuture);
  return new Date(nextDay);
}

export async function addTestExams(inputUserId) {
  let userId = inputUserId || "samanthasId";
  const exam1 = await addTestExam({
    subject: "Biology",
    color: "#979250",
    userId
  });
  const exam2 = await addTestExam({
    subject: "Archeology",
    examDate: getFutureDay(new Date(), 2),
    startDate: getFutureDay(new Date(), -5),
    lastPage: 48,
    timePerPage: 10,
    startPage: 7,
    currentPage: 20,
    timesRepeat: 2,
    color: "#2444A8",
    userId
  });
  const exam3 = await addTestExam({
    subject: "Chemistry",
    examDate: getFutureDay(new Date(), 1),
    startDate: getFutureDay(new Date(), -20),
    lastPage: 47,
    timePerPage: 10,
    startPage: 8,
    currentPage: 160,
    timesRepeat: 5,
    color: "#2328A9",
    userId
  });
  const exam4 = await addTestExam({
    subject: "Dance",
    examDate: getFutureDay(new Date(), 51),
    startDate: getFutureDay(new Date(), 30),
    color: "#85625A",
    userId
  });

  return { exam1, exam2, exam3, exam4 };
}

export async function clearDatabase() {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  await mongoose.connection.dropDatabase();
  if (global.gc) global.gc();
}

export async function teardown() {
  // await mongoose.connection.db.dropDatabase();
  //await db.dropDatabase();
  // await db.users.drop();
  // await db.close();
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
  // mongoose = "";
  // mongod = "";
  global.gc();
}
