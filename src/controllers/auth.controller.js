import bcrypt from "bcryptjs";
const { hash, compare } = bcrypt;
import { UserModel, TokenModel } from "../models/index.js";
import {
  validateRefreshToken,
  validateLogin,
  validateForgotPassword,
} from "../validators/user.validator.js";
import pkg from "jsonwebtoken";
const { verify } = pkg;
import { GLOBAL_MESSAGES, GLOBAL_ENV } from "../config/globalConfig.js";
import {
  serverErrorHelper,
  ipHelper,
  errorHelper,
} from "../helpers/utilityHelper.js";
import { signAccessToken, signRefreshToken } from "../helpers/jwtHelper.js";

const forgotPassword = async (req, res) => {
  const { error } = validateForgotPassword(req.body);
  if (error)
    return res.status(400).json({
      ...GLOBAL_MESSAGES.validationError,
      resultMessage: error.details[0].message,
    });

  const hashed = await hash(req.body.password, 10);

  await UserModel.updateOne(
    { _id: req.user._id, isVerified: true },
    { $set: { password: hashed } }
  ).catch((err) => {
    return res.status(500).json(serverErrorHelper(req, err.message));
  });
  return res.status(200).json(GLOBAL_MESSAGES.updateSuccess);
};

const login = async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) {
    return res.status(400).json({
      ...GLOBAL_MESSAGES.validationError,
      resultMessage: error.details[0].message,
    });
  }

  const user = await UserModel.findOne({
    email: req.body.email,
    isVerified: true,
  })
    .select("+password")
    .catch((err) => {
      return res.status(500).json(serverErrorHelper(req, err.message));
    });

  if (!user) return res.status(404).json(GLOBAL_MESSAGES.emailNotFound);

  if (!user.isVerified)
    return res.status(400).json(GLOBAL_MESSAGES.accountNotVerified);

  const match = await compare(req.body.password, user.password);
  if (!match) return res.status(400).json(GLOBAL_MESSAGES.invalidCredentials);

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  //NOTE: 604800000 ms is equal to 7 days. So, the expiry date of the token is 7 days after.
  const tokenExists = await TokenModel.exists({ userId: user._id });
  if (tokenExists) {
    await TokenModel.updateOne(
      { userId: user._id },
      {
        $set: {
          refreshToken: refreshToken,
          status: true,
          expiresIn: Date.now() + 604800000,
          createdAt: Date.now(),
        },
      }
    ).catch((err) => {
      return res.status(500).json(serverErrorHelper(req, err.message));
    });
  } else {
    let token = new TokenModel({
      userId: user._id,
      refreshToken: refreshToken,
      status: true,
      createdByIp: ipHelper(req),
      expiresIn: Date.now() + 604800000,
      createdAt: Date.now(),
    });
    await token.save().catch((err) => {
      return res.status(500).json(serverErrorHelper(req, err.message));
    });
  }
  return res.status(200).json({
    ...GLOBAL_MESSAGES.readSuccess,
    user,
    accessToken,
    refreshToken,
  });
};

const logout = async (req, res) => {
  await TokenModel.updateOne(
    { userId: req.user._id },
    {
      $set: { status: false, expiresIn: Date.now() },
    }
  ).catch((err) => {
    return res.status(500).json(serverErrorHelper(req, err.message));
  });
  return res.status(200).json(GLOBAL_MESSAGES.updateSuccess);
};

const refreshToken = async (req, res) => {
  const { error } = validateRefreshToken(req.body);
  if (error)
    return res.status(400).json({
      ...GLOBAL_MESSAGES.invalidRequest,
      resultMessage: error.details[0].message,
    });

  try {
    req.user = verify(req.body.refreshToken, GLOBAL_ENV.refreshTokenSecretKey);
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

  const userToken = await TokenModel.findOne({ userId: req.user._id }).catch(
    (err) => {
      return res.status(500).json(serverErrorHelper(req, err.message));
    }
  );

  if (userToken.refreshToken !== req.body.refreshToken || !userToken)
    return res.status(404).json(GLOBAL_MESSAGES.invalidJWT);

  if (userToken.expiresIn <= Date.now() || !userToken.status)
    return res.status(400).json(GLOBAL_MESSAGES.jwtExpired);

  const accessToken = signAccessToken(req.user._id);
  const refreshToken = signRefreshToken(req.user._id);

  await TokenModel.updateOne(
    { userId: req.user._id },
    {
      $set: {
        refreshToken: refreshToken,
        createdByIp: ipHelper(req),
        createdAt: Date.now(),
        expires: Date.now() + 604800000,
        status: true,
      },
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

export { forgotPassword, login, logout, refreshToken };
