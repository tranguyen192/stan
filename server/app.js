import "dotenv/config";
import express from "express";
import { typeDefs } from "./typedefs";
import { resolvers } from "./resolvers";
import mongoose from "mongoose";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "apollo-server";
import { isAuth } from "./helpers/authentication/is-auth";
import cookieParser from "cookie-parser";
import { handleRefreshTokenRoute } from "./helpers/authentication/authenticationTokens";
import path from "path";
import compress from "compression";
import StanScheduler from "./helpers/StanScheduler";
import depthLimit from "graphql-depth-limit";
import { createComplexityLimitRule } from "graphql-validation-complexity";
import timeout from "connect-timeout";
import sslRedirect from "heroku-ssl-redirect";

const connectionString = process.env.MONGODB_URI || "mongodb://localhost/MMP3";
const app = express();
const PORT = process.env.PORT || 5000;
app.use(timeout("5s"));
app.use(compress());

mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })

  .then(() => {
    console.log("connected to db ");
  })
  .catch(e => console.error(e.message));

app.use(cookieParser());

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

new StanScheduler();

const apolloServer = new ApolloServer({
  schema,

  context: async ({ req, res }) => ({
    req,
    res,
    userInfo: await isAuth(req)
  }),
  engine: {
    apiKey: process.env.ENGINE_API_KEY_VAR,
    schemaTag: process.env.NODE_ENV
  },
  cacheControl: {
    defaultMaxAge: 20
  },

  playground: {
    settings: {
      "request.credentials": "same-origin"
      // "editor.theme": "light"
    }
  },
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)]
});

//special route for updating access token - for security reasons
app.post("/refresh_token", async (req, res) => {
  await handleRefreshTokenRoute(req, res);
});

if (process.env.NODE_ENV === "production") {
  app.use(sslRedirect());
  app.use("/backend", express.static(__dirname + "/backend"));
  app.get("/backend", (req, res) => {
    res.sendFile(path.resolve(__dirname, "backend", "index.html"));
  });

  app.use(express.static("public"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
  });
} else {
  app.use("/backend", express.static(__dirname + "/backend"));
  app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "backend", "index.html"));
  });
  let origin = "http://localhost:3000";
  const corsOptions = {
    origin: [origin],
    credentials: true
  };

  app.use(cors(corsOptions));
}

apolloServer.applyMiddleware({ app, cors: false });

app.listen({ port: PORT }, () =>
  console.log(`🚀 Server ready at http://localhost:5000${apolloServer.graphqlPath}`)
);
