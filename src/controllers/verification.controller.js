import { User, Token } from "../models/index.js";
import { jwtSecretKey } from "../config/envConfig.js";
import pkg from "jsonwebtoken";
const { verify } = pkg;
import { sendCodeToEmail } from "../helpers/emailHelper.js";
import {
  validateSendVerificationCode,
  validateVerifyEmail,
} from "../validators/user.validator.js";
import { GLOBAL_CODES } from "../config/globalConfig.js";
import {
  errorHelper,
  generateRandomCode,
  ipHelper,
} from "../helpers/utilityHelper.js";
import {
  signAccessToken,
  signRefreshToken,
  signConfirmCodeToken,
} from "../helpers/jwtHelper.js";

const sendVerificationCode = async (req, res) => {
  const { error } = validateSendVerificationCode(req.body);
  if (error)
    return res
      .status(400)
      .json(errorHelper("00026", req, error.details[0].message));

  const user = await User.findOne({
    email: req.body.email,
    isActivated: true,
  }).catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });

  if (!user) return res.status(404).json(errorHelper("00036", req));

  const emailCode = generateRandomCode(4);
  await sendCodeToEmail(
    req.body.email,
    user.name,
    emailCode,
    "newCode",
    req,
    res
  );

  user.isVerified = false;

  await user.save().catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });

  const confirmCodeToken = signConfirmCodeToken(user._id, emailCode);
  return res.status(200).json({
    resultMessage: GLOBAL_CODES["00048"],
    resultCode: "00048",
    confirmToken: confirmCodeToken,
  });
};

const verifyEmail = async (req, res) => {
  const { error } = validateVerifyEmail(req.body);
  if (error)
    return res
      .status(400)
      .json(errorHelper("00053", req, error.details[0].message));

  try {
    req.user = verify(req.body.token, jwtSecretKey);
  } catch (err) {
    return res.status(400).json(errorHelper("00055", req, err.message));
  }

  const exists = await User.exists({
    _id: req.user._id,
    isActivated: true,
  }).catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });

  if (!exists) return res.status(400).json(errorHelper("00052", req));

  if (req.body.code !== req.user.code)
    return res.status(400).json(errorHelper("00054", req));

  await User.updateOne(
    { _id: req.user._id },
    { $set: { isVerified: true } }
  ).catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });

  const accessToken = signAccessToken(req.user._id);
  const refreshToken = signRefreshToken(req.user._id);
  await Token.updateOne(
    { userId: req.user._id },
    {
      $set: {
        userId: req.user._id,
        refreshToken: refreshToken,
        status: true,
        expires: Date.now() + 604800000,
        createdAt: Date.now(),
        createdByIp: ipHelper(req),
      },
    },
    {
      upsert: true,
    }
  ).catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });
  return res.status(200).json({
    resultMessage: GLOBAL_CODES["00058"],
    resultCode: "00058",
    accessToken,
    refreshToken,
  });
};

const sendVerificationEmail = async (req, res) => {
  const { error } = validateSendVerificationCode(req.body);
  if (error)
    return res
      .status(400)
      .json(errorHelper("00026", req, error.details[0].message));

  const user = await User.findOne({
    email: req.body.email,
    isActivated: true,
  }).catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });

  if (!user) return res.status(404).json(errorHelper("00036", req));

  const emailCode = generateRandomCode(4);
  await sendCodeToEmail(
    req.body.email,
    user.name,
    emailCode,
    "newCode",
    req,
    res
  );

  user.isVerified = false;

  await user.save().catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });

  const confirmCodeToken = signConfirmCodeToken(user._id, emailCode);
  return res.status(200).json({
    resultMessage: GLOBAL_CODES["00048"],
    resultCode: "00048",
    confirmToken: confirmCodeToken,
  });
};

export { sendVerificationCode, verifyEmail, sendVerificationEmail };
