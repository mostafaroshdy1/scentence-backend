import mongoose from "mongoose";

export { VerificationModel };

const UserVerificationSchema = mongoose.Schema({
  userID: { type: String },
  uniqueString: { type: String },
  createdAt: { type: Date },
  expireAt: { type: Date },
});

const VerificationModel = mongoose.model(
  "userverification",
  UserVerificationSchema
);
