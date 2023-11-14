import express from "express";
import { createServer } from "http";
import loader from "./loaders/index.js";
import { GLOBAL_ENV } from "./config/globalConfig.js";

const app = express();
loader(app);

const httpServer = createServer(app);

httpServer.listen(GLOBAL_ENV.port, (err) => {
  if (err) {
    console.log(err);
    return process.exit(1);
  }
  console.log(`Server is running on ${GLOBAL_ENV.serverIP}:${GLOBAL_ENV.port}`);
});

export default app;
