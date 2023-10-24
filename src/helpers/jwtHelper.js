import pkg from "jsonwebtoken";
const { sign } = pkg;
import { jwtSecretKey, refreshTokenSecretKey } from "../config/envConfig.js";

const signAccessToken = (userId) => {
  const accessToken = sign({ _id: userId }, jwtSecretKey, {
    expiresIn: "1d",
  });
  return accessToken;
};
const signRefreshToken = (userId) => {
  const refreshToken = sign({ _id: userId }, refreshTokenSecretKey, {
    expiresIn: "7d",
  });
  return refreshToken;
};
const signConfirmCodeToken = (userId, confirmCode) => {
  const confirmCodeToken = sign(
    { _id: userId, code: confirmCode },
    jwtSecretKey,
    {
      expiresIn: "5m",
    }
  );
  return confirmCodeToken;
};

export { signAccessToken, signConfirmCodeToken, signRefreshToken };
