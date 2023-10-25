import { User, Token } from "../models/index.js";
import { jwtSecretKey } from "../config/envConfig.js";
import pkg from "mongoose";
const { Types } = pkg;
import jwt from "jsonwebtoken";
import { errorHelper } from "../helpers/utilityHelper.js";
const { verify } = jwt;

const authorizedAccess = async (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) return res.status(401).json(errorHelper("00006", req));

  if (token.includes("Bearer"))
    token = req.header("Authorization").replace("Bearer ", "");

  try {
    req.user = verify(token, jwtSecretKey);
    if (!Types.ObjectId.isValid(req.user._id))
      return res.status(400).json(errorHelper("00007", req));

    const exists = await User.exists({
      _id: req.user._id,
      isVerified: true,
      isActivated: true,
    }).catch((err) => {
      return res.status(500).json(errorHelper("serverError", req, err.message));
    });

    if (!exists) return res.status(400).json(errorHelper("00009", req));

    const tokenExists = await Token.exists({
      userId: req.user._id,
      status: true,
    }).catch((err) => {
      return res.status(500).json(errorHelper("serverError", req, err.message));
    });

    if (!tokenExists) return res.status(401).json(errorHelper("00011", req));

    next();
  } catch (err) {
    return res.status(401).json(errorHelper("00012", req, err.message));
  }
};

const checkAdmin = async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select("type")
    .catch((err) => {
      return res.status(500).json(errorHelper("serverError", req, err.message));
    });

  if (user.type !== "admin")
    return res.status(403).json(errorHelper("00017", req));

  next();
};

const checkCreator = async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select("type")
    .catch((err) => {
      return res.status(500).json(errorHelper("serverError", req, err.message));
    });

  if (user.type !== "creator" && user.type !== "admin")
    return res.status(403).json(errorHelper("00017", req));

  next();
};

const checkReader = async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select("type")
    .catch((err) => {
      return res.status(500).json(errorHelper("serverError", req, err.message));
    });

  if (user.type === "user")
    return res.status(403).json(errorHelper("00017", req));

  next();
};

export { authorizedAccess, checkAdmin, checkReader, checkCreator };
