import express from 'express';
const router = express.Router();
import passport from "../auth/google.js";
import { googleLoginCallback } from '../controllers/auth.controller.js';

import { login, logout, sendOTP, verifyOTP, createUser, refreshAccessToken, getMe } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false, prompt: 'select_account' }),
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login`, session: false }),
  googleLoginCallback
);

router.post('/login', login)
router.post('/send-otp', sendOTP)
router.post('/verify-otp', verifyOTP)
router.post('/create-user', createUser)
router.post('/refresh-access-token', refreshAccessToken)

router.get('/me', authMiddleware, getMe)

router.delete('/logout', logout)

router.get('/admin', authMiddleware, roleMiddleware('Admin'), (req, res) => {
  res.json({
    msg: 'Hello Admin'
  })
})

export default router;
