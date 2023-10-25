import mongoose from "mongoose";
import { dbUri } from "../config/envConfig.js";

export default async () => {
  mongoose.set("strictQuery", false);
  await mongoose
    .connect(dbUri, {})
    .then(() => {
      console.log("Mongodb Connection Success.");
    })
    .catch((err) => {
      console.log(err);
    });
};
