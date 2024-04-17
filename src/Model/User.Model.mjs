import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ExpressError } from "../utils/ExpressError.mjs";

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email Required"],
    unique: [true, "Email Already Exists"],
    lowercase: true,
  },
  username: { type: String },
  password: {
    type: String,
    required: [true, "Password Required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  image: { type: String },
  gender: {
    type: String,
    enum: {
      values: ["male", "female"],
      message: "Gender must be Male or Female",
    },
  },
});

userSchema.post("save", (doc, next) => {
  console.log("User Created Successfully", doc);
  next();
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email: email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw new ExpressError("Incorrect Password", 400);
  }
  throw new ExpressError("User is not registered", 400);
};

const UserModel = mongoose.model("user", userSchema);

export { UserModel };
