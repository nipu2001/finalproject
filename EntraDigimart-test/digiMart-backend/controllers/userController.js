// controllers/authController.js
const User = require('../models/User');
const Seller = require('../models/Seller');
const Affiliate = require('../models/Affiliate');
const Investor = require('../models/Investor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/database');
const nodemailer = require('nodemailer');

// JWT token generation
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const userId = await User.create({ name, email, password, phone, address, role });

    if (role === 'seller') {
      const { businessName, businessAddress, idNumber, bankAccount } = req.body;
      const businessImage = req.files?.businessImage ? req.files.businessImage[0].filename : null;
      const idImage = req.files?.idImage ? req.files.idImage[0].filename : null;
      const bankProofImage = req.files?.bankProofImage ? req.files.bankProofImage[0].filename : null;

      await Seller.create({
        userId,
        businessName,
        businessAddress,
        idNumber,
        bankAccount,
        businessImage,
        idImage,
        bankProofImage
      });
    } else if (role === 'affiliate') {
      const { websiteUrl, affiliateType, agreedToTerms } = req.body;
      await Affiliate.create({ userId, websiteUrl, affiliateType, agreedToTerms });
    } else if (role === 'investor') {
      const { agreedToTerms } = req.body;
      const bankProofImage = req.files?.bankProofImage ? req.files.bankProofImage[0].filename : null;
      await Investor.create({ userId, bankProofImage, agreedToTerms });
    }

    const token = generateToken(userId);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, name, email, role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    let profileData = {};
    if (user.role === 'seller') {
      profileData = await Seller.findByUserId(user.id);
    } else if (user.role === 'affiliate') {
      profileData = await Affiliate.findByUserId(user.id);
    } else if (user.role === 'investor') {
      profileData = await Investor.findByUserId(user.id);
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: profileData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Forgot password - UPDATED TO 6-DIGIT CODE
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log('Generated verification code:', verificationCode);

    const db = getDB();
    
    await db.execute(
      'DELETE FROM password_reset_tokens WHERE user_id = ?',
      [user.id]
    );

    await db.execute(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, verificationCode, expiresAt]
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Code - DigiMarket',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You have requested to reset your password. Use the verification code below:</p>
          <div style="background-color: #fff3e0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #f97316; font-size: 32px; letter-spacing: 5px; margin: 0;">
              ${verificationCode}
            </h1>
          </div>
          <p>This code will expire in <strong>15 minutes</strong>.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true,
      message: 'Verification code sent to your email' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Reset password - UPDATED TO USE VERIFICATION CODE
exports.resetPassword = async (req, res) => {
  console.log('===== RESET PASSWORD DEBUG =====');
  console.log('Full request body:', JSON.stringify(req.body));
  console.log('================================');

  try {
    const { verificationCode, newPassword } = req.body;

    console.log('verificationCode:', verificationCode);
    console.log('newPassword length:', newPassword?.length);

    if (!verificationCode || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Verification code and new password are required' 
      });
    }

    const db = getDB();
    
    const [rows] = await db.execute(
      `SELECT prt.*, u.id as user_id 
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = ? AND prt.expires_at > NOW()`,
      [verificationCode]
    );

    console.log('Tokens found:', rows.length);

    if (rows.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid or expired reset code' 
      });
    }

    const resetToken = rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log('Updating password for user:', resetToken.user_id);

    await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, resetToken.user_id]
    );

    await db.execute(
      'DELETE FROM password_reset_tokens WHERE id = ?',
      [resetToken.id]
    );

    console.log('Password reset successful');

    res.json({ 
      success: true,
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let profileData = {};
    if (user.role === 'seller') {
      profileData = await Seller.findByUserId(userId);
    } else if (user.role === 'affiliate') {
      profileData = await Affiliate.findByUserId(userId);
    } else if (user.role === 'investor') {
      profileData = await Investor.findByUserId(userId);
    }

    res.json({
      user: {
        ...user,
        profile: profileData
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, address } = req.body;

    await User.update(userId, { name, phone, address });

    const user = await User.findById(userId);

    if (user.role === 'seller') {
      const { businessName, businessAddress, idNumber, bankAccount } = req.body;
      const businessImage = req.files?.businessImage ? req.files.businessImage[0].filename : null;
      const idImage = req.files?.idImage ? req.files.idImage[0].filename : null;
      const bankProofImage = req.files?.bankProofImage ? req.files.bankProofImage[0].filename : null;

      await Seller.update(userId, {
        businessName,
        businessAddress,
        idNumber,
        bankAccount,
        businessImage,
        idImage,
        bankProofImage
      });
    } else if (user.role === 'affiliate') {
      const { websiteUrl, affiliateType, agreedToTerms } = req.body;
      await Affiliate.update(userId, { websiteUrl, affiliateType, agreedToTerms });
    } else if (user.role === 'investor') {
      const { agreedToTerms, company } = req.body;
      const bankProofImage = req.files?.bankProofImage ? req.files.bankProofImage[0].filename : null;
      await Investor.update(userId, { bankProofImage, agreedToTerms, company });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};