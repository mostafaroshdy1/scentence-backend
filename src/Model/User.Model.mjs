import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ExpressError } from '../utils/ExpressError.mjs';

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email Required'],
    unique: [true, 'Email Already Exists'],
    lowercase: true,
  },
  username: { type: String },
  password: {
    type: String,
    required: [true, 'Password Required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  image: { type: String },
  gender: {
    type: String,
    enum: {
      values: ['male', 'female'],
      message: 'Gender must be Male or Female',
    },
  },
  verified: { type: Boolean },
  role: {
    type: String,
    default: 'user',
  },
  fullName: { type: String, minlength: [3, 'full name must be at least 6 characters long'] },
  birthDate: { type: Date },
});
//After Saving Event
userSchema.post('save', (doc, next) => {
  console.log('User Created Successfully', doc);
  next();
});
// To Hash Passwords
userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
// Login Static Function
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email: email });
  if (user) {
    // console.log(password);
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw new ExpressError('Incorrect Password', 400);
  }
  throw new ExpressError('User is not registered', 400);
};

const UserModel = mongoose.model('User', userSchema);

export { UserModel };
