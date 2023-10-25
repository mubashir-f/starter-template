import { UserModel } from "../models/index.js";
import { generate } from "randomstring";
import { LogModel } from "../models/index.js";

const ipHelper = (req) =>
  req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"].split(/, /)[0]
    : req.connection.remoteAddress;

const logHelper = async (logData, userId, level, req) => {
  let ip = "no-ip";
  if (req !== "") ip = ipHelper(req);
  const global_log = {
    resultCode: logData.resultCode,
    level: level,
    errorMessage: logData.resultMessage,
    ip: ip,
  };
  console.log("@global_logs:", global_log);
  let logObject = new LogModel(global_log);
  if (userId !== "" && userId) logObject.userId = userId;
  await logObject.save().catch((err) => {
    console.log("Logging is failed: " + err);
  });
};

const generateRandomCode = (length) => generate({ length, charset: "numeric" });

const serverErrorHelper = async (req, error) => {
  let userId = "";
  if (req && req.user && req.user._id) userId = req.user._id;
  logHelper(
    {
      resultMessage: error,
      resultCode: "00004",
    },
    userId,
    "Server Error",
    req
  );
  return error;
};

const errorHelper = async (errorData, level = "", req) => {
  let userId = "";
  if (req && req.user && req.user._id) userId = req.user._id;
  logHelper(errorData, userId, level, req);
  return errorData;
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
    let existsUsername = await UserModel.exists({ username: username }).catch(
      (err) => {
        return res.status(500).json(serverErrorHelper(req, err.message));
      }
    );
    if (!existsUsername) return username;
    console.log("@userName", username);
  } while (true);
};

export {
  serverErrorHelper,
  errorHelper,
  getUniqueUserName,
  generateRandomCode,
  logHelper,
  ipHelper,
};
