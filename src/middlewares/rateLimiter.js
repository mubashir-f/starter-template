import mongoose from "mongoose";
import { RateLimiterMongo } from "rate-limiter-flexible";
import { GLOBAL_ENV, GLOBAL_MESSAGES } from "../config/globalConfig.js";
// import { GLOBAL_MESSAGES, GLOBAL_ENV } from "../config/globalConfig.js";loba

mongoose.set("strictQuery", false);
const mongoConn = mongoose.createConnection(GLOBAL_ENV.dbUri, {});

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
