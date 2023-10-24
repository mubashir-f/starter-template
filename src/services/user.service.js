import { User } from "../models/index.js";
import ApiError from "../utils/APIError.js";

const createNewUser = async (req, res) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError("Invaid User Id");
  return user;
};

export { getUserFromId };
