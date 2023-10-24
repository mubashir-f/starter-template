import bcrypt from "bcryptjs";
const { hash, compare } = bcrypt;
import { User, Token } from "../models/index.js";
import {
  errorHelper,
  ipHelper,
  signAccessToken,
  signRefreshToken,
} from "../utils/index.js";
import {
  validateRefreshToken,
  validateLogin,
  validateForgotPassword,
} from "../validators/user.validator.js";
import { refreshTokenSecretKey } from "../config/index.js";
import pkg from "jsonwebtoken";
import { GLOBAL_CODES } from "../config/globalConfig.js";

const { verify } = pkg;

const forgotPassword = async (req, res) => {
  const { error } = validateForgotPassword(req.body);
  if (error)
    return res
      .status(400)
      .json(errorHelper("00066", req, error.details[0].message));

  const hashed = await hash(req.body.password, 10);

  await User.updateOne(
    { _id: req.user._id, isVerified: true, isActivated: true },
    { $set: { password: hashed } }
  ).catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });
  return res.status(200).json({
    resultMessage: GLOBAL_CODES["00068"],
    resultCode: "00068",
  });
};

const login = async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) {
    let code = "00025";
    if (error.details[0].message.includes("email")) code = "00026";
    else if (error.details[0].message.includes("password")) code = "00027";

    return res
      .status(400)
      .json(errorHelper(code, req, error.details[0].message));
  }

  const user = await User.findOne({
    email: req.body.email,
    isActivated: true,
    isVerified: true,
  })
    .select("+password")
    .catch((err) => {
      return res.status(500).json(errorHelper("serverError", req, err.message));
    });

  if (!user) return res.status(404).json(errorHelper("00036", req));

  if (!user.isActivated) return res.status(400).json(errorHelper("00043", req));

  if (!user.isVerified) return res.status(400).json(errorHelper("00044", req));

  const match = await compare(req.body.password, user.password);
  if (!match) return res.status(400).json(errorHelper("00045", req));

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  //NOTE: 604800000 ms is equal to 7 days. So, the expiry date of the token is 7 days after.
  const tokenExists = await Token.exists({ userId: user._id });
  if (tokenExists) {
    await Token.updateOne(
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
      return res.status(500).json(errorHelper("serverError", req, err.message));
    });
  } else {
    let token = new Token({
      userId: user._id,
      refreshToken: refreshToken,
      status: true,
      createdByIp: ipHelper(req),
      expiresIn: Date.now() + 604800000,
      createdAt: Date.now(),
    });
    await token.save().catch((err) => {
      return res.status(500).json(errorHelper("serverError", req, err.message));
    });
  }
  return res.status(200).json({
    resultMessage: GLOBAL_CODES["00047"],
    resultCode: "00047",
    user,
    accessToken,
    refreshToken,
  });
};

const logout = async (req, res) => {
  await Token.updateOne(
    { userId: req.user._id },
    {
      $set: { status: false, expiresIn: Date.now() },
    }
  ).catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });
  return res.status(200).json({
    resultMessage: GLOBAL_CODES["00050"],
    resultCode: "00050",
  });
};

const refreshToken = async (req, res) => {
  const { error } = validateRefreshToken(req.body);
  if (error)
    return res
      .status(400)
      .json(errorHelper("00059", req, error.details[0].message));

  try {
    req.user = verify(req.body.refreshToken, refreshTokenSecretKey);
  } catch (err) {
    return res.status(400).json(errorHelper("00063", req, err.message));
  }

  const userToken = await Token.findOne({ userId: req.user._id }).catch(
    (err) => {
      return res.status(500).json(errorHelper("serverError", req, err.message));
    }
  );

  if (userToken.refreshToken !== req.body.refreshToken || !userToken)
    return res.status(404).json(errorHelper("00061", req));

  if (userToken.expiresIn <= Date.now() || !userToken.status)
    return res.status(400).json(errorHelper("00062", req));

  const accessToken = signAccessToken(req.user._id);
  const refreshToken = signRefreshToken(req.user._id);

  await Token.updateOne(
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
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });

  return res.status(200).json({
    resultMessage: GLOBAL_CODES["00065"],
    resultCode: "00065",
    accessToken,
    refreshToken,
  });
};

export { forgotPassword, login, logout, refreshToken };
