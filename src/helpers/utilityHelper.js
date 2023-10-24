import { User } from "../models/index.js";
import { generate } from "randomstring";
import { Log } from "../models/index.js";

const ipHelper = (req) =>
  req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"].split(/, /)[0]
    : req.connection.remoteAddress;

const logHelper = async (code, userId, errorMessage, level, req) => {
  let ip = "no-ip";
  if (req !== "") ip = ipHelper(req);
  let log = new Log({
    resultCode: code,
    level: level,
    errorMessage: errorMessage,
    ip: ip,
  });

  if (userId !== "" && userId) log.userId = userId;

  await log.save().catch((err) => {
    console.log("Logging is failed: " + err);
  });
};

const generateRandomCode = (length) => generate({ length, charset: "numeric" });

const errorHelper = async (code, req, errorMessage) => {
  let userId = "";
  if (req && req.user && req.user._id) userId = req.user._id;

  if (errorMessage.includes("server error")) {
    logHelper(code, userId, errorMessage, "Server Error", req);
  } else {
    logHelper(code, userId, errorMessage, "Client Error", req);
  }

  return {
    resultMessage: errorMessage,
    resultCode: code,
  };
};

const getUniqueUserName = async (name, req, res) => {
  let tempName = "";
  let username = "";
  if (name.includes(" ")) {
    tempName = name.trim().split(" ").slice(0, 1).join("").toLowerCase();
  } else {
    tempName = name.toLowerCase().trim();
  }
  do {
    username = tempName + generateRandomCode(4);
    let existsUsername = await User.exists({ username: username }).catch(
      (err) => {
        return res
          .status(500)
          .json(errorHelper("serverError", req, err.message));
      }
    );
    if (!existsUsername) return username;
    console.log("@userName", username);
  } while (true);
};

export {
  getUniqueUserName,
  errorHelper,
  generateRandomCode,
  logHelper,
  ipHelper,
};
