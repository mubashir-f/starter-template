import { UserModel, TokenModel } from "../models/index.js";
import {
  validateRegister,
  validateChangePassword,
} from "../validators/user.validator.js";
import bcrypt from "bcryptjs";
import { GLOBAL_MESSAGES } from "../config/globalConfig.js";
import {
  errorHelper,
  generateRandomCode,
  getUniqueUserName,
  serverErrorHelper,
} from "../helpers/utilityHelper.js";
import { signConfirmCodeToken } from "../helpers/jwtHelper.js";
const { hash } = bcrypt;

const register = async (req, res) => {
  const { error } = validateRegister(req.body);
  if (error) {
    return res.status(400).json({
      ...GLOBAL_MESSAGES.invalidRequest,
      resultMessage: error.details[0].message,
    });
  }

  const exists = await UserModel.exists({ email: req.body.email }).catch((err) => {
    return res.status(500).json(serverErrorHelper(req, err.message));
  });

  if (exists) return res.status(409).json(GLOBAL_MESSAGES.duplicateEmail);

  const hashed = await hash(req.body.password, 10);

  const emailCode = generateRandomCode(4);
  let name = req.body.name;
  let username = await getUniqueUserName(name, req, res);
  const url = req.protocol + "://" + req.get("host");

  let user = new UserModel({
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
    return res.status(500).json(serverErrorHelper(req, err.message));
  });

  user.password = null;

  const confirmCodeToken = signConfirmCodeToken(user._id, emailCode);

  return res.status(200).json({
    ...GLOBAL_MESSAGES.createSuccess,
    user,
    confirmToken: confirmCodeToken,
  });
};

const deleteUser = async (req, res) => {
  const anon = "anon" + generateRandomCode(8);
  const hashed = await hash(anon, 10);
  await UserModel.updateOne(
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
    return res.status(500).json(serverErrorHelper(req, err.message));
  });

  await TokenModel.deleteOne({ userId: req.user._id }).catch((err) => {
    return res.status(500).json(serverErrorHelper(req, err.message));
  });

  return res.status(200).json(GLOBAL_MESSAGES.deletedSuccess);
};

const getUser = async (req, res) => {
  let user = await UserModel.findById(req.user._id).catch((err) => {
    return res.status(500).json(serverErrorHelper(req, err.message));
  });

  return res.status(200).json({
    ...GLOBAL_MESSAGES.readSuccess,
    user,
  });
};

const changePassword = async (req, res) => {
  const { error } = validateChangePassword(req.body);
  if (error) {
    return res.status(400).json({
      ...GLOBAL_MESSAGES.invalidRequest,
      resultMessage: error.details[0].message,
    });
  }

  if (req.body.oldPassword === req.body.newPassword)
    return res.status(400).json(GLOBAL_MESSAGES.passwordMustDifferent);

  const user = await UserModel.findById(req.user._id)
    .select("password")
    .catch((err) => {
      return res.status(500).json(serverErrorHelper(req, err.message));
    });

  const match = await compare(req.body.oldPassword, user.password).catch(
    (err) => {
      return res.status(500).json(serverErrorHelper(req, err.message));
    }
  );

  if (!match) return res.status(400).json(GLOBAL_MESSAGES.passwordMustMatch);

  const hashed = await hash(req.body.newPassword, 10).catch((err) => {
    return res.status(500).json(serverErrorHelper(req, err.message));
  });

  user.password = hashed;

  await user.save().catch((err) => {
    return res.status(500).json(serverErrorHelper(req, err.message));
  });
  return res.status(200).json(GLOBAL_MESSAGES.updateSuccess);
};

const updateUser = async (req, res) => {
  const url = req.protocol + "://" + req.get("host");

  const user = await UserModel.findById(req.user._id).catch((err) => {
    return res.status(500).json(serverErrorHelper(req, err.message));
  });

  if (req.body.name) user.name = req.body.name;
  if (req.body.gender) user.gender = req.body.gender;
  if (req.body.birthDate) user.birthDate = req.body.birthDate;
  if (req.body.username && req.body.username !== user.username) {
    const exist = await UserModel.exists({ username: req.body.username }).catch(
      (err) => {
        return res.status(500).json(serverErrorHelper(req, err.message));
      }
    );
    if (exist) return res.status(400).json(GLOBAL_MESSAGES);

    user.username = req.body.username;
  }

  if (req.file) {
    user.photoUrl = url + "/images/" + req.file.filename;
  }

  await user.save().catch((err) => {
    return res.status(500).json(serverErrorHelper(req, err.message));
  });
  return res.status(200).json({
    ...GLOBAL_MESSAGES.updateSuccess,
    photoUrl: user.photoUrl,
  });
};

export { register, deleteUser, getUser, changePassword, updateUser };
