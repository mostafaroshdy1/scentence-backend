import { UserModel } from '../Model/User.Model.mjs';
import { VerificationModel } from '../Model/Verification.Model.mjs';
import { catchAsync } from '../utils/catchAsync.mjs';

const profile = (req, res) => {
  const user = req.decodedUser;
  return res.status(200).json({ Name: 'Profile', Users: user });
};

const verify = async (req, res) => {
  const { id, uuid } = req.params;
  try {
    const user = await UserModel.findOne({ _id: id });
    if (!user) {
      console.log('No User');
      return res.status(400).json({ Status: 400, Error: 'Invalid Link' });
    }

    const uid = await VerificationModel.findOne({
      userID: user._id,
      uniqueString: uuid,
    });

    if (!uid) {
      console.log('No UUID');
      return res.status(400).json({ Status: 400, Error: 'Invalid Link' });
    }

    const currentDate = new Date();

    if (uid.expireAt > currentDate) {
      return res.status(400).json({ status: 400, Error: 'Link Expired' });
    }

    const verified = await UserModel.updateOne({
      _id: user._id,
      verified: true,
    });
    await VerificationModel.findByIdAndDelete(uid._id);

    if (verified) {
      return res
        .status(200)
        .json({ Status: 200, Msg: 'User Verified Successfully' });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ Status: 400, Error: 'Error Occured' });
  }
};

// Admin
const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.findByIdAndDelete(id);
  if (!user) {
    return res.status(400).json({ Status: 400, error: 'User Not Found' });
  }
  return res.status(200).json({ Status: 200, message: 'User Deleted' });
});

const getUsers = catchAsync(async (req, res) => {
  const users = await UserModel.aggregate([
    {
      $match: {
        role: 'user',
      },
    },
  ]);
  if (!users) {
    return res.status(400).json({ Status: 400, error: 'No Users Found' });
  }
  return res.status(200).json({ Status: 200, Users: users });
});

const getUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.findById(id);
  // .populate('orders')
  // .populate('cart')
  // .exec();
  if (!user) {
    return res.status(400).json({ Status: 400, error: 'User Not Found' });
  }
  return res.status(200).json({ Status: 200, User: user });
});

const countUsers = catchAsync(async (req, res) => {
  const count = await UserModel.aggregate([
    {
      $match: {
        role: 'user',
      },
    },
    {
      $count: 'users',
    },
  ]);
  return res.status(200).json({ count });
});

const UserController = {
  profile,
  verify,
  deleteUser,
  getUsers,
  getUser,
  countUsers,
};

export { UserController };
