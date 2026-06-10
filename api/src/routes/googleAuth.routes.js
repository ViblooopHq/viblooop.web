import express from 'express';
const router = express.Router();
import passport from "../auth/google.js";
import { googleLoginCallback } from '../controllers/auth.controller.js';

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/', session: false }),
    googleLoginCallback
);

export default router;