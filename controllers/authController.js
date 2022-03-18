import User from '../models/User.js';
import UserVerification from '../models/UserVerification.js';
import { INTERNAL_SERVER_ERROR, StatusCodes } from 'http-status-codes';
import sendVerficaitonEmail from '../utils/sendVerificationEmail.js';

// errors
import {
  BadRequestError,
  UnAuthenticatedError,
  NotFoundError,
} from '../errors/index.js';

const host = process.env.HOST;

const register = async (req, res) => {
  const { name, email, password, verified, status } = req.body;
  if (!name || !email || !password) {
    throw new BadRequestError('Please provide all values');
  }

  const emailAlreadyExist = await User.findOne({
    email: req.body.email.toLowerCase(),
  });

  if (emailAlreadyExist && emailAlreadyExist.isVerified) {
    throw new BadRequestError('Email is already registered! please log in');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const newUser = await User.findOne({ email: req.body.email.toLowerCase() });
  const linkDoc = await UserVerification.create({
    userId: newUser._id,
    email,
  });

  const currentUser = await UserVerification.findOne({ userId: newUser._id });

  const link = `http://${host}/verify/` + currentUser.token;

  //sending email
  sendVerficaitonEmail({ to: newUser.email, link });

  res.status(StatusCodes.OK).json({
    user: { email: user.email, isVerified: user.isVerified },
  });
};

const resend = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError('Please provide email');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnAuthenticatedError(
      'we are unable to find a user with this email. Kindly register.'
    );
  }
  if (!user.isVerified) {
    throw new BadRequestError(
      'This account has already been verified. Please log in.'
    );
  }

  //delete previous verification user token,
  const verificationTokenExist = await UserVerification.findOne({
    userId: user._id,
  });
  if (verificationTokenExist) {
    //sending email
    const link = `http://${host}/verify/` + verificationTokenExist.token;
    sendVerficaitonEmail({ to: verificationTokenExist.email, link });

    // console.log('resend verification link when token exist');
    return res.status(StatusCodes.OK).json({
      user: { email: user.email, isVerified: user.isVerified },
    });
  }
  // Create a verification user token, save it, and send email
  const newUser = await UserVerification.create({ userId: user._id, email });
  const link = `http://${host}/verify/` + newUser.token;
  //sending email
  sendVerficaitonEmail({ to: newUser.email, link });
  // console.log('resend verification link token not exist');
  res.status(StatusCodes.OK).json({
    user: { email: user.email, isVerified: user.isVerified },
  });
};

const verify = async (req, res) => {
  console.log(req.body);
  const { verificationToken } = req.params.token;
  if (verificationToken) throw new NotFoundError('unable to find this user');
  const userToken = await UserVerification.findOne({
    emailhashed: verificationToken,
  });

  if (!userToken)
    throw new BadRequestError(
      'We were unable to find a valid link. Your link is expired.'
    );

  const nonVerifiedUser = await User.findOne({ _id: userToken.userId });
  if (!nonVerifiedUser)
    throw new NotFoundError(
      'We were unable to find a user for this link.Kindly Register again'
    );
  if (nonVerifiedUser.isverified)
    throw new BadRequestError(
      'This user has already been verified. please log in'
    );

  //verify and save the user
  const update = { isVerified: true, status: 'active', expiredAt: null };
  const updatedUser = await nonVerifiedUser.updateOne(update);
  const user = await User.findOne({ _id: userToken.userId });
  if (!user.isVerified)
    throw new BadRequestError(
      'This user is not verified. Kindly verify your email'
    );

  const token = user.createJWT();

  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      status: user.status,
    },
    token,
  });
  throw new Error({ message: 'Something goes wrong' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Please provide all values');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new UnAuthenticatedError('email not found!Please register');
  }

  if (!user.isVerified) {
    throw new UnAuthenticatedError('Kindly verify your email!!');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnAuthenticatedError('Invalid credentials');
  }

  const token = user.createJWT();
  user.password = undefined;
  res.status(StatusCodes.OK).json({
    user,
    token,
  });
  res.send('login user');
  throw new Error({ message: 'Something goes wrong' });
};

const updateUser = async (req, res) => {
  res.send('Update user');
};

export { register, resend, verify, login, updateUser };
