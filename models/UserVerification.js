import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const UserVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
    email: {
      type: String,
      ref: 'User',
      required: [true, 'Please provide email'],
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid email',
      },
      unique: true,
    },
    token: {
      type: String,
      ref: 'User',
      unique: true,
    },
    expiredAt: {
      type: Date,
      expires: 120,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

UserVerificationSchema.pre('save', async function () {
  this.email = await this.email.toLowerCase();
  const emailSalt = await bcrypt.genSalt(10);
  this.token = await bcrypt.hash(this.email, emailSalt);
  this.token = this.token.replace(/\//g, '_').replace(/\+/g, '-');
});

UserVerificationSchema.methods.comparePassword = async function (
  candidateemail
) {
  const isMatch = await bcrypt.compare(candidateemail, this.emailhashed);
  return isMatch;
};

export default mongoose.model('UserVerification', UserVerificationSchema);
