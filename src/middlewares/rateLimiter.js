import mongoose from "mongoose";
import { RateLimiterMongo } from "rate-limiter-flexible";
import { dbUri } from "../config/envConfig.js";
import { GLOBAL_MESSAGES } from "../config/globalConfig.js";

mongoose.set("strictQuery", false);
const mongoConn = mongoose.createConnection(dbUri, {});

const opts = {
  storeClient: mongoConn,
  tableName: "rateLimits",
  points: 100, // x requests
  duration: 60, // per y second by IP
};

const mongoRateLimiter = (req, res, next) => {
  const rateLimiterMongo = new RateLimiterMongo(opts);
  rateLimiterMongo
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch((err) => {
      return res.status(429).json(
        {
          ...GLOBAL_MESSAGES.rateLimitError,
          resultMessage: err.details[0].message,
        },
        "Server Error",
        req
      );
    });
};

export { mongoRateLimiter };
