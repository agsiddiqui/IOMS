import express from 'express';
const router = express.Router();

import {
  register,
  resend,
  verify,
  login,
  updateUser,
} from '../controllers/authController.js';
// import authenticateUser from '../middleware/auth.js';

router.post('/register', register);
router.post('/resend', resend);
router.get('/verify/:token', verify);
router.post('/login', login);
router.patch('/updateUser', updateUser);

export default router;
