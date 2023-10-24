import mongoose from "mongoose";
import { RateLimiterMongo } from "rate-limiter-flexible";
import { dbUri } from "../config/envConfig.js";
import { errorHelper } from "../utils/helper.js";

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
      return res.status(429).json(errorHelper("00024", req, err.message));
    });
};

export { mongoRateLimiter };
