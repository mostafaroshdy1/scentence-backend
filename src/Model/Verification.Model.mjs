import mongoose from "mongoose";
import { ExpressError } from "../utils/ExpressError.mjs";

const UserVerificationSchema = mongoose.Schema({
  userID: { type: String },
  uniqueString: { type: String },
  createdAt: { type: Date },
  expireAt: { type: Date, expires: 21600 }
});

const VerificationModel = mongoose.model(
  "userverification",
  UserVerificationSchema
);

export { VerificationModel };
