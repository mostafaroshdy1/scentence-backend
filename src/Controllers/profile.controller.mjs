import { ExpressError } from "../utils/ExpressError.mjs";
import { UserModel } from "../Model/User.Model.mjs";
import cloudinary from "cloudinary";
export { get, update, destroy };

async function get(req, res) {
  const { email } = req.decodedUser;
  const user = await UserModel.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  const userInfo = {
    image: user.image,
    fullName: user.fullName,
    birthDate: user.birthDate,
  };

  return res.send(userInfo);
}

async function update(req, res) {
  const { email } = req.decodedUser;
  const user = await UserModel.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  if (req.fileUploadError) {
    return res.json({
      message: "invalid file, accepted files->(png,jpg,jpeg)",
    });
  }

  let updatedUser;
  if (req.files && req.files.length) {
    const result = await cloudinary.uploader.upload(req.files[0].path);
    updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      { ...req.body, image: result.secure_url },
      { new: true }
    );
  } else {
    updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      { ...req.body },
      { new: true }
    );
  }

  return res.status(201).json({
    message: "User Updated Successfully",
    updatedUser,
  });
}

async function destroy(req, res) {
  const { email } = req.decodedUser;
  const user = await UserModel.findOne({ email: email });
  const uesr = await UserModel.findByIdAndDelete({ _id: user._id });
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }
  res.status(200).json({ message: "User Deleted Successfully" });
}
