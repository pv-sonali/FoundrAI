const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { z } = require('zod');
const nodemailer = require('nodemailer');
const { protect, JWT_SECRET } = require('../middleware/auth');
const User = require('../models/User');
const Analytics = require('../models/Analytics');

// Configure Nodemailer (Using Ethereal for testing or real SMTP if configured)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'test@ethereal.email',
    pass: process.env.SMTP_PASS || 'testpass',
  },
});

const sendEmail = async (mailOptions) => {
  if (process.env.SMTP_PASS === 'testpass' || !process.env.SMTP_PASS) {
    console.log('\n=== MOCK EMAIL SENT ===');
    console.log(`To: ${mailOptions.to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(`Body: ${mailOptions.text}`);
    console.log('=======================\n');
    return;
  }
  return transporter.sendMail(mailOptions);
};

// Zod Schemas
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    // Set first user in system to admin if we want, or just default founder
    const count = await User.countDocuments({});
    const role = count === 0 ? 'admin' : 'founder';

    const rawVerificationToken = crypto.randomBytes(20).toString('hex');
    const verificationToken = crypto.createHash('sha256').update(rawVerificationToken).digest('hex');

    const user = await User.create({
      name,
      email,
      password,
      role,
      verificationToken,
    });

    // Send Verification Email
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${rawVerificationToken}`;
    try {
      await sendEmail({
        from: '"FoundrAI" <noreply@foundrai.com>',
        to: user.email,
        subject: 'Verify Your Email',
        text: `Please verify your email by clicking this link: ${verifyUrl}`,
      });
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
    }

    // Record login/registration action
    await Analytics.create({
      userId: user._id,
      action: 'USER_REGISTER',
      details: `User registered with email: ${email}`,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        aiCredits: user.aiCredits,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Record login action
    await Analytics.create({
      userId: user._id,
      action: 'USER_LOGIN',
      details: 'User logged in successfully',
    });

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        aiCredits: user.aiCredits,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with token
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required.' });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ verificationToken: hashedToken });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    await Analytics.create({
      userId: user._id,
      action: 'EMAIL_VERIFY',
      details: 'Email address verified successfully',
    });

    return res.json({ success: true, message: 'Email verified successfully.' });
  } catch (err) {
    console.error('Email verification error:', err);
    return res.status(500).json({ success: false, message: 'Server error during email verification.' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate password reset token
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email address.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    console.log(`[PASSWORD RESET LINK MOCK]: ${resetUrl}`);

    try {
      await sendEmail({
        from: '"FoundrAI" <noreply@foundrai.com>',
        to: user.email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click here to reset: ${resetUrl}`,
      });
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr);
    }

    return res.json({
      success: true,
      message: 'Password reset link sent to email.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Server error during password reset request.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        subscription: req.user.subscription,
        aiCredits: req.user.aiCredits,
        isVerified: req.user.isVerified,
      },
    });
  } catch (err) {
    console.error('Me endpoint error:', err);
    return res.status(500).json({ success: false, message: 'Server error loading profile.' });
  }
});

module.exports = router;
