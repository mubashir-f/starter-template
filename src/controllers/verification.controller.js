import { UserModel, TokenModel } from "../models/index.js";
import pkg from "jsonwebtoken";
const { verify } = pkg;
import { sendCodeToEmail } from "../helpers/emailHelper.js";
import {
  validateSendVerificationCode,
  validateVerifyEmail,
} from "../validators/user.validator.js";
import { GLOBAL_MESSAGES } from "../config/globalConfig.js";
import {
  errorHelper,
  generateRandomCode,
  ipHelper,
  serverErrorHelper,
} from "../helpers/utilityHelper.js";
import {
  signAccessToken,
  signRefreshToken,
  signConfirmCodeToken,
} from "../helpers/jwtHelper.js";

const sendVerificationCode = async (req, res) => {
  const { error } = validateSendVerificationCode(req.body);
  if (error)
    return res.status(400).json({
      ...GLOBAL_MESSAGES.invalidRequest,
      resultMessage: error.details[0].message,
    });

  const user = await UserModel.findOne({
    email: req.body.email,
  }).catch((err) => {
    return res.status(500).json(serverErrorHelper(req, err.message));
  });

  if (!user) return res.status(404).json(GLOBAL_MESSAGES.emailNotFound);

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
    return res.status(500).json(serverErrorHelper(req, err.message));
  });

  const confirmCodeToken = signConfirmCodeToken(user._id, emailCode);
  return res.status(200).json({
    ...GLOBAL_MESSAGES.readSuccess,
    confirmToken: confirmCodeToken,
  });
};

const verifyEmail = async (req, res) => {
  const { error } = validateVerifyEmail(req.body);
  if (error)
    return res.status(400).json({
      ...GLOBAL_MESSAGES.invalidRequest,
      resultMessage: error.details[0].message,
    });

  try {
    req.user = verify(req.body.token, GLOBAL_ENV.jwtSecretKey);
  } catch (err) {
    return res
      .status(400)
      .json(
        errorHelper(
          { ...GLOBAL_MESSAGES.invalidJWT, resultMessage: err.message },
          "Client Error",
          req
        )
      );
  }

  const exists = await UserModel.exists({
    _id: req.user._id,
  }).catch((err) => {
    return res.status(500).json(serverErrorHelper(req, err.message));
  });

  if (!exists) return res.status(400).json(GLOBAL_MESSAGES.dataNotFound);

  if (req.body.code !== req.user.code)
    return res.status(400).json(GLOBAL_MESSAGES.invalidCode);

  await UserModel.updateOne(
    { _id: req.user._id },
    { $set: { isVerified: true } }
  ).catch((err) => {
    return res.status(500).json(serverErrorHelper(req, err.message));
  });

  const accessToken = signAccessToken(req.user._id);
  const refreshToken = signRefreshToken(req.user._id);
  await TokenModel.updateOne(
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
    return res.status(500).json(serverErrorHelper(req, err.message));
  });
  return res.status(200).json({
    ...GLOBAL_MESSAGES.readSuccess,
    accessToken,
    refreshToken,
  });
};

const sendVerificationEmail = async (req, res) => {
  const { error } = validateSendVerificationCode(req.body);
  if (error)
    return res.status(400).json({
      ...GLOBAL_MESSAGES.invalidRequest,
      resultMessage: error.details[0].message,
    });

  const user = await UserModel.findOne({
    email: req.body.email,
  }).catch((err) => {
    return res.status(500).json(serverErrorHelper(req, err.message));
  });

  if (!user) return res.status(404).json(GLOBAL_MESSAGES.emailNotFound);

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
    return res.status(500).json(serverErrorHelper(req, err.message));
  });

  const confirmCodeToken = signConfirmCodeToken(user._id, emailCode);
  return res.status(200).json({
    ...GLOBAL_MESSAGES.readSuccess,
    confirmToken: confirmCodeToken,
  });
};

export { sendVerificationCode, verifyEmail, sendVerificationEmail };
