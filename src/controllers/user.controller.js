import { User, Token } from "../models/index.js";
import {
  validateRegister,
  validateChangePassword,
} from "../validators/user.validator.js";
import {
  generateRandomCode,
  errorHelper,
  signConfirmCodeToken,
} from "../utils/index.js";
import bcrypt from "bcryptjs";
import { GLOBAL_CODES } from "../config/globalConfig.js";
import { getUniqueUserName } from "../utils/helper.js";

const { hash } = bcrypt;

const register = async (req, res) => {
  const { error } = validateRegister(req.body);
  if (error) {
    let code = "00025";
    if (error.details[0].message.includes("email")) code = "00026";
    else if (error.details[0].message.includes("password")) code = "00027";
    else if (error.details[0].message.includes("name")) code = "00077";
    return res
      .status(400)
      .json(errorHelper(code, req, error.details[0].message));
  }

  const exists = await User.exists({ email: req.body.email }).catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });

  if (exists) return res.status(409).json(errorHelper("00032", req));

  const hashed = await hash(req.body.password, 10);

  const emailCode = generateRandomCode(4);
  let name = req.body.name;
  let username = await getUniqueUserName(name, req, res);
  const url = req.protocol + "://" + req.get("host");

  let user = new User({
    email: req.body.email,
    password: hashed,
    name: name,
    username: username,
    photoUrl: `${url}/images/avatar.png`,
    gender: req.body.gender,
    courtName: req.body.courtName,
    city: req.body.city,
    isVerified: true,
    type: req.body.type,
    lastLogin: Date.now(),
  });

  user = await user.save().catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });

  user.password = null;

  const confirmCodeToken = signConfirmCodeToken(user._id, emailCode);

  return res.status(200).json({
    resultMessage: GLOBAL_CODES["00035"],
    resultCode: "00035",
    user,
    confirmToken: confirmCodeToken,
  });
};

const deleteUser = async (req, res) => {
  const anon = "anon" + generateRandomCode(8);
  const hashed = await hash(anon, 10);
  await User.updateOne(
    { _id: req.user._id },
    {
      $set: {
        name: anon,
        username: anon,
        email: anon + "@anon.com",
        password: hashed,
        photoUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/1200px-Node.js_logo.svg.png",
        isActivated: false,
        deletedAt: Date.now(),
      },
    }
  ).catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });

  await Token.deleteOne({ userId: req.user._id }).catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });

  return res.status(200).json({
    resultMessage: GLOBAL_CODES["00092"],
    resultCode: "00092",
  });
};

const getUser = async (req, res) => {
  let user = await User.findById(req.user._id).catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });

  return res.status(200).json({
    resultMessage: GLOBAL_CODES["00089"],
    resultCode: "00089",
    user,
  });
};

const changePassword = async (req, res) => {
  const { error } = validateChangePassword(req.body);
  if (error)
    return res
      .status(400)
      .json(errorHelper("00027", req, error.details[0].message));

  if (req.body.oldPassword === req.body.newPassword)
    return res.status(400).json(errorHelper("00073", req));

  const user = await User.findById(req.user._id)
    .select("password")
    .catch((err) => {
      return res.status(500).json(errorHelper("serverError", req, err.message));
    });

  const match = await compare(req.body.oldPassword, user.password).catch(
    (err) => {
      return res.status(500).json(errorHelper("serverError", req, err.message));
    }
  );

  if (!match) return res.status(400).json(errorHelper("00072", req));

  const hashed = await hash(req.body.newPassword, 10).catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });

  user.password = hashed;

  await user.save().catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });
  return res.status(200).json({
    resultMessage: GLOBAL_CODES["00076"],
    resultCode: "00076",
  });
};

const updateUser = async (req, res) => {
  const url = req.protocol + "://" + req.get("host");

  const user = await User.findById(req.user._id).catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });

  if (req.body.name) user.name = req.body.name;
  if (req.body.gender) user.gender = req.body.gender;
  if (req.body.birthDate) user.birthDate = req.body.birthDate;
  if (req.body.username && req.body.username !== user.username) {
    const exist = await User.exists({ username: req.body.username }).catch(
      (err) => {
        return res
          .status(500)
          .json(errorHelper("serverError", req, err.message));
      }
    );
    if (exist) return res.status(400).json(errorHelper("00084", req));

    user.username = req.body.username;
  }

  if (req.file) {
    user.photoUrl = url + "/images/" + req.file.filename;
  }

  await user.save().catch((err) => {
    return res.status(500).json(errorHelper("serverError", req, err.message));
  });
  return res.status(200).json({
    resultMessage: GLOBAL_CODES["00086"],
    resultCode: "00086",
    photoUrl: user.photoUrl,
  });
};

export { register, deleteUser, getUser, changePassword, updateUser };
