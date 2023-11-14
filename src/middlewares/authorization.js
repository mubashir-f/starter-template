import { UserModel, TokenModel } from "../models/index.js";
import pkg from "mongoose";
const { Types } = pkg;
import jwt from "jsonwebtoken";
import { errorHelper, serverErrorHelper } from "../helpers/utilityHelper.js";
import { GLOBAL_MESSAGES,GLOBAL_ENV } from "../config/globalConfig.js";

const { verify } = jwt;

const authorizedAccess = async (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) return res.status(401).json(GLOBAL_MESSAGES.jwtRequired);

  if (token.includes("Bearer"))
    token = req.header("Authorization").replace("Bearer ", "");

  try {
    req.user = verify(token, GLOBAL_ENV.jwtSecretKey);
    if (!Types.ObjectId.isValid(req.user._id))
      return res.status(400).json(GLOBAL_MESSAGES.invalidData);

    const exists = await UserModel.exists({
      _id: req.user._id,
      isVerified: true,
    }).catch((err) => {
      return res.status(500).json(serverErrorHelper(req, err.message));
    });

    if (!exists) return res.status(400).json(GLOBAL_MESSAGES.dataNotFound);

    const tokenExists = await TokenModel.exists({
      userId: req.user._id,
      status: true,
    }).catch((err) => {
      return res.status(500).json(serverErrorHelper(req, err.message));
    });

    if (!tokenExists)
      return res.status(401).json(GLOBAL_MESSAGES.sessionExpired);

    next();
  } catch (err) {
    return res.status(401).json(
      errorHelper(
        {
          ...GLOBAL_MESSAGES.invalidRequest,
          resultMessage: err.message,
        },
        "Client Error",
        req
      )
    );
  }
};

const checkAdmin = async (req, res, next) => {
  const user = await UserModel.findById(req.user._id)
    .select("type")
    .catch((err) => {
      return res.status(500).json(serverErrorHelper(req, err.message));
    });

  if (user.type !== "admin")
    return res.status(403).json(GLOBAL_MESSAGES.accessDenied);

  next();
};

const checkCreator = async (req, res, next) => {
  const user = await UserModel.findById(req.user._id)
    .select("type")
    .catch((err) => {
      return res.status(500).json(serverErrorHelper(req, err.message));
    });

  if (user.type !== "creator" && user.type !== "admin")
    return res.status(403).json(GLOBAL_MESSAGES.accessDenied);

  next();
};

const checkReader = async (req, res, next) => {
  const user = await UserModel.findById(req.user._id)
    .select("type")
    .catch((err) => {
      return res.status(500).json(serverErrorHelper(req, err.message));
    });

  if (user.type === "user")
    return res.status(403).json(GLOBAL_MESSAGES.accessDenied);

  next();
};

export { authorizedAccess, checkAdmin, checkReader, checkCreator };
