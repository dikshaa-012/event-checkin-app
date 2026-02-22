import express from "express";
import http from "http";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import context from "./context";
import setupSocket from "./socket";
import jwt from "jsonwebtoken";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Event Check-In Backend is running");
});

const httpServer = http.createServer(app);

async function start() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const auth = req.headers.authorization || "";
      const token = auth.replace("Bearer ", "");

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as jwt.JwtPayload;

        return { user: { id: decoded.userId } };
      } catch {
        return {};
      }
    },
  });

  await server.start();

  server.applyMiddleware({ app: app as any });

  setupSocket(httpServer);

  const PORT = process.env.PORT || 5000;

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready on port ${PORT}`);
  });
}

start();