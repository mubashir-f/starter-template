import { UserModel } from "../models/index.js";

const createNewUser = async (req, res) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new ApiError("Invaid UserModel Id");
  return user;
};

export { createNewUser };
