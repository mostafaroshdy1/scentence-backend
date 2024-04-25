import { UserModel } from "../Model/User.Model.mjs";
import { VerificationModel } from "../Model/Verification.Model.mjs";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../utils/sendmail.mjs";


const profile = (req, res) => {
  const user = req.decodedUser;
  return res.status(200).json({ Name: "Profile", Users: user });
};

const verify = async (req, res) => {
  const { id, uuid } = req.params;
  try {
    const user = await UserModel.findOne({ _id: id });
    if (!user) {
      console.log("No User");
      return res.status(400).json({ Status: 400, Error: "Invalid Link" });
    }

    const uid = await VerificationModel.findOne({
      userID: user._id,
      uniqueString: uuid,
    });

    if (!uid) {
      console.log("No UUID");
      return res.status(400).json({ Status: 400, Error: "Invalid Link" });
    }

    const currentDate = new Date();

    if (uid.expireAt < currentDate) {
      return res.status(400).json({ status: 400, Error: "Link Expired" });
    }

    const verified = await UserModel.updateOne({
      _id: user._id,
      verified: true,
    });
    await VerificationModel.findByIdAndDelete(uid._id);

    if (verified) {
      return res
        .status(200)
        .json({ Status: 200, Msg: "User Verified Successfully" });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ Status: 400, Error: "Error Occured" });
  }
};

const resetLink = async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {email} = req.body;

  const user = await UserModel.findOne({email:email});

  if(user){
    const subject = "Password Reset";
    const text = "Reset Your Password";
    const route = "/User/ResetPassword/";
    sendVerificationEmail({ _id: user._id, email: user.email }, subject,text,route);
    console.log("Password reset Link Sent Successfully");
    return res.status(200).json({status:200,msg:"Password Reset Link Sent Successfully"});
  } else {
    console.log("Failed To Send Password Reset Link");
    return res.status(400).json({status:400,msg:"Failed To Send Password Reset Link"});
  }
};

const resetLogic = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  try {
    const user = await UserModel.findOne({ _id: id });

    if (user) {
      const { password } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({ status: 200, message: "Password reset successful" });
    } else {
      return res.status(400).json({ status: 400, error: "User Not Found" });
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ status: 500, error: "Internal Server Error" });
  }
};


const UserController = { profile, verify,resetLink,resetLogic };

export { UserController };
