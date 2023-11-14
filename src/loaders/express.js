import express from "express";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import helmet from "helmet";
import routes from "../routes/index.js";
import bodyParser from "body-parser";
import { mongoRateLimiter } from "../middlewares/rateLimiter.js";
import { logHelper } from "../helpers/utilityHelper.js";
import { GLOBAL_MESSAGES, GLOBAL_ENV } from "../config/globalConfig.js";

export default (app) => {
  process.on("uncaughtException", async (error) => {
    console.log(error);
    logHelper(GLOBAL_MESSAGES.uncaughtException, "", "Server", "");
  });

  process.on("unhandledRejection", async (error) => {
    console.log(error);
    logHelper(GLOBAL_MESSAGES.unhandledRejection, "", "Server", "");
  });

  app.enable("trust proxy");
  app.use(cors());
  app.use(
    bodyParser.urlencoded({
      parameterLimit: 100000,
      limit: "50mb",
      extended: false,
    })
  );
  app.use(bodyParser.json());
  app.use(morgan("dev"));
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(compression());
  app.use(express.static("public"));
  app.disable("x-powered-by");
  app.disable("etag");

  app.use(mongoRateLimiter);
  app.use("/api", routes);

  app.get("/", (_req, res) => {
    return res.status(200).json(GLOBAL_MESSAGES.serverStatus).end();
  });

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Content-Security-Policy-Report-Only", "default-src: https:");
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT POST PATCH DELETE GET");
      return res.status(200).json({});
    }
    next();
  });

  app.use((_req, _res, next) => {
    const error = new Error("Endpoint could not find!");
    error.status = 404;
    next(error);
  });

  app.use((error, req, res, _next) => {
    res.status(error.status || 500);
    let errorMessage = {
      ...GLOBAL_MESSAGES.serverError,
      resultMessage: error.message,
    };
    logHelper(errorMessage, "", "Server Error", req);
    return res.json(errorMessage);
  });
};
