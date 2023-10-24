import { logger } from "../index.js";

export default (code, req, errorMessage) => {
  let userId = "";
  if (req && req.user && req.user._id) userId = req.user._id;

  if (errorMessage.includes("server error")) {
    logger(code, userId, errorMessage, "Server Error", req);
  } else {
    logger(code, userId, errorMessage, "Client Error", req);
  }

  return {
    resultMessage: errorMessage,
    resultCode: code,
  };
};
