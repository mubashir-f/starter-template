import express from "express";
import { createServer } from "http";
import { port, serverIP } from "./config/index.js";
import loader from "./loaders/index.js";

const app = express();
loader(app);

const httpServer = createServer(app);

httpServer.listen(port, (err) => {
  if (err) {
    console.log(err);
    return process.exit(1);
  }
  console.log(`Server is running on ${serverIP}:${port}`);
});

export default app;
