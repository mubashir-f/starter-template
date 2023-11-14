import pkg from "jsonwebtoken";
import { GLOBAL_ENV } from "../config/globalConfig.js";
const { sign } = pkg;

const signAccessToken = (userId) => {
  const accessToken = sign({ _id: userId }, GLOBAL_ENV.jwtSecretKey, {
    expiresIn: "1d",
  });
  return accessToken;
};
const signRefreshToken = (userId) => {
  const refreshToken = sign({ _id: userId }, GLOBAL_ENV.refreshTokenSecretKey, {
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
