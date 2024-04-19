import { UserModel } from "../Model/User.Model.mjs";
import { VerificationModel } from "../Model/Verification.Model.mjs";

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

    if (uid.expireAt > currentDate) {
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

const UserController = { profile, verify };

export { UserController };
