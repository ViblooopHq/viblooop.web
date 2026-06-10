import User from '../models/user/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokens, blacklistJwtToken, createJwtToken, verifyRefreshToken } from '../services/auth.service.js';
import { sendResponse } from '../utils/response.util.js';
import { otpService } from '../services/otp.service.js';

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const role = 'User'

    if (!username || !email || !password) {
      return res.status(400).json({
        msg: 'Please enter all fields'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        msg: 'Password must be at least 6 characters'
      })
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        msg: 'Please enter a valid email'
      })
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        msg: 'User alreay exists'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role })
    await user.save();

    res.status(201).json({
      msg: 'User Created successfully'
    })
  } catch (err) {
    res.status(500).json({
      error: err.message
    })
    console.error(err.message)
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })

    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return sendResponse(res, 401, false, "Invalid credentials");
    }

    const userPayload = {
      id: user._id,
      username: user.username,
      email: user.email,
      verified: user.verified,
      role: user.role
    }
    const { accessToken, refreshToken } = await generateTokens(userPayload);

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
    };

    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      path: '/auth/refresh-access-token',
      maxAge: 15 * 24 * 60 * 60 * 1000
    });

    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 2 * 60 * 60 * 1000
    });

    return sendResponse(res, 200, true, "Login successful");
  } catch (err) {
    return sendResponse(res, 500, false, "Internal server error");
  }
}

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, 400, false, "Email is required");
    }

    const otp = await otpService.generateAndSendOTP(email);
    if (otp) {
      return sendResponse(res, 200, true, "OTP sent successfully");
    }
    return sendResponse(res, 500, false, "OTP sent failed");
  } catch (err) {
    return sendResponse(res, 500, false, "Internal server error");
  }
}

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendResponse(res, 400, false, "Email and OTP are required");
    }

    const otpVerified = await otpService.verifyOTPWithSecret(email, otp);

    if (!otpVerified) {
      return sendResponse(res, 400, false, "Invalid OTP");
    }

    const user = await User.findOne({ email })

    if (!user) {
      return sendResponse(res, 200, false, "User not found");
    }

    const userPayload = {
      id: user._id,
      username: user.username,
      email: user.email,
      verified: user.verified,
    }
    const { accessToken, refreshToken } = await generateTokens(userPayload);

    // Cookie Configuration for Dev vs Prod
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd, // Only send over HTTPS in production 
      sameSite: isProd ? 'strict' : 'lax', // CSRF protection 
    };

    // Set Refresh Token in a secure httpOnly cookie
    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      path: '/auth/refresh-access-token', // Only sent to the refresh endpoint
      maxAge: 15 * 24 * 60 * 60 * 1000
    });

    // Set Access Token (Angular needs to read this to know it's logged in)
    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 2 * 60 * 60 * 1000
    });

    return sendResponse(res, 200, true, "Login successful");
  } catch (err) {
    return sendResponse(res, 500, false, "Internal server error");
  }
}

export const createUser = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!email || !username) {
      return sendResponse(res, 400, false, "Email and username are required");
    }

    const user = await User.findOne({ email })

    if (user) {
      return sendResponse(res, 400, false, "User already exists");
    }

    const newUser = await User.create({ email: email, username: username });
    if (newUser) {
      const userPayload = {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        verified: newUser.verified,
      }

      const { accessToken, refreshToken } = await generateTokens(userPayload);

      // Cookie Configuration for Dev vs Prod
      const isProd = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProd, // Only send over HTTPS in production 
        sameSite: isProd ? 'strict' : 'lax', // CSRF protection 
      };

      // Set Refresh Token in a secure httpOnly cookie
      res.cookie('refresh_token', refreshToken, {
        ...cookieOptions,
        path: '/auth/refresh-access-token', // Only sent to the refresh endpoint
        maxAge: 15 * 24 * 60 * 60 * 1000
      });

      // Set Access Token (Angular needs to read this to know it's logged in)
      res.cookie('access_token', accessToken, {
        ...cookieOptions,
        maxAge: 2 * 60 * 60 * 1000
      });

      return sendResponse(res, 200, true, "User created successfully");
    }

    return sendResponse(res, 500, false, "User creation failed");
  } catch (err) {
    return sendResponse(res, 500, false, "Internal server error");
  }
}

// OAuth Login 
export const googleLoginCallback = async (req, res) => {
  try {
    const { googleUserId, username, email, profileImage } = req.user;

    let user = await User.findOne({ email: email })

    if (!user) {
      user = await User.create({ googleUserId: googleUserId, email: email, username: username, profileImage: profileImage });
    }

    const userPayload = {
      id: user._id,
      username: user.username,
      email: user.email,
      verified: user.verified,
    }

    const { accessToken, refreshToken } = await generateTokens(userPayload);

    // Cookie Configuration for Dev vs Prod
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd, // Only send over HTTPS in production 
      sameSite: isProd ? 'strict' : 'lax', // CSRF protection 
    };

    // Set Refresh Token in a secure httpOnly cookie
    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      path: '/auth/refresh-access-token', // Only sent to the refresh endpoint
      maxAge: 15 * 24 * 60 * 60 * 1000
    });

    // Set Access Token (Angular needs to read this to know it's logged in)
    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 2 * 60 * 60 * 1000
    });

    return res.redirect(process.env.FRONTEND_URL);
  } catch (err) {
    return sendResponse(res, 500, false, "Internal server error");
  }
}

export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.status(401).send('Access Denied');

  try {
    const verified = await verifyRefreshToken(refreshToken);

    const user = await User.findById(verified.id);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    const userPayload = {
      id: user._id,
      username: user.username,
      email: user.email,
      verified: user.verified,
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(userPayload);

    // Cookie Configuration for Dev vs Prod
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd, // Only send over HTTPS in production 
      sameSite: isProd ? 'strict' : 'lax', // CSRF protection 
    };

    // Set Refresh Token in a secure httpOnly cookie
    res.cookie('refresh_token', newRefreshToken, {
      ...cookieOptions,
      path: '/auth/refresh-access-token', // Only sent to the refresh endpoint
      maxAge: 15 * 24 * 60 * 60 * 1000
    });

    // Set Access Token (Angular needs to read this to know it's logged in)
    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 2 * 60 * 60 * 1000
    });

    return sendResponse(res, 200, true, "Token refreshed");
  } catch (err) {
    return sendResponse(res, 403, false, "Invalid Refresh Token");
  }
}

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    const filterUserDetails = {
      id: user._id,
      username: user.username,
      profileImage: user.profileImage,
      verified: user.verified,
    }

    return sendResponse(res, 200, true, "User details", filterUserDetails);
  } catch (err) {
    return sendResponse(res, 500, false, "Internal server error");
  }
}

// contains OAuth Logout
export async function logout(req, res) {
  try {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (accessToken) await blacklistJwtToken(accessToken).catch(() => {});
    if (refreshToken) await blacklistJwtToken(refreshToken).catch(() => {});

    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/auth/refresh-access-token' });

    if (req.user && req.user.googleUserId) {
      return req.logout(function (err) {
        if (err) { return sendResponse(res, 500, false, "Internal server error") }
        return sendResponse(res, 200, true, "Logged out successfully");
      });
    }
    
    return sendResponse(res, 200, true, "Logged out successfully");
  } catch (err) {
    return sendResponse(res, 500, false, "Internal server error");
  }
} 
