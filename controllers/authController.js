const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "locallink_jwt_secret_key_2026_secure_key";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, city } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: role || "user",
      phone: phone ? phone.trim() : "",
      city: city ? city.trim() : "",
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        city: user.city,
        notifications: user.notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user and include password for comparison
    let user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user) {
      // Auto-create user on login for seamless demo & registration flow
      const isProviderRole = cleanEmail.includes("provider");
      const defaultName = cleanEmail.includes("aman") ? "Aman Sharma" : cleanEmail.split("@")[0];
      user = await User.create({
        name: defaultName,
        email: cleanEmail,
        password: password,
        role: isProviderRole ? "provider" : "user",
        phone: "+91 98765 12345",
        city: "Lucknow, UP",
      });
    } else {
      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid password. Please check your credentials or try quick demo logins.",
        });
      }
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        city: user.city,
        favorites: user.favorites,
        notifications: user.notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };