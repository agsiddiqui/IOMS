import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      minlength: 3,
      maxlength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid email',
      },
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
      select: false,
    },
    isVerified: { type: String, default: false },
    organization: {
      type: String,
      minlength: 3,
      maxlength: 50,
      trim: true,
      default: 'organization',
    },
    role: {
      type: String,
      minlength: 3,
      maxlength: 10,
      enum: ['master', 'admin', 'operator'],
      default: 'master',
    },
    status: {
      type: String,
      enum: ['inactive', 'active'],
      default: 'inactive',
    },
    expiredAt: {
      type: Date,
      expires: 3600,
      default: Date.now,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.email = await this.email.toLowerCase();
});

UserSchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export default mongoose.model('User', UserSchema);
