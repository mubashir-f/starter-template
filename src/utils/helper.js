import { User } from "../models.js";

const getUniqueUserName = async (name, req, res) => {
  let tempName = "";
  let username = "";
  if (name.includes(" ")) {
    tempName = name.trim().split(" ").slice(0, 1).join("").toLowerCase();
  } else {
    tempName = name.toLowerCase().trim();
  }
  do {
    username = tempName + generateRandomCode(4);
    let existsUsername = await User.exists({ username: username }).catch(
      (err) => {
        return res
          .status(500)
          .json(errorHelper("serverError", req, err.message));
      }
    );
    if (!existsUsername) return username;
    console.log("@userName", username);
  } while (true);
};

export { getUniqueUserName };
