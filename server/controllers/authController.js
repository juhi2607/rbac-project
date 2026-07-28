const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const createAuditLog = require('../utils/auditLogger');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'User with this email already exists');
    }

    const user = await User.create({ name, email, password, role: role || 'User' });

    const token = generateToken(user._id);

    await createAuditLog({
      action: `User registered: ${user.name} (${user.role})`,
      entity: 'Auth',
      entityId: user._id,
      performedBy: user._id,
      details: { name: user.name, email: user.email, role: user.role },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 201, 'Registration successful', {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Include password field for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    if (!user.isActive) {
      return sendError(res, 401, 'Your account has been deactivated. Contact an admin.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    await createAuditLog({
      action: `User logged in: ${user.name}`,
      entity: 'Auth',
      entityId: user._id,
      performedBy: user._id,
      details: { email: user.email },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Login successful', {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    return sendSuccess(res, 200, 'Profile fetched successfully', { user });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (name) user.name = name;

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return sendError(res, 400, 'Current password is required to set a new password');
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return sendError(res, 400, 'Current password is incorrect');
      }
      user.password = newPassword;
    }

    await user.save();

    await createAuditLog({
      action: `User updated their profile: ${user.name}`,
      entity: 'User',
      entityId: user._id,
      performedBy: user._id,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Profile updated successfully', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { register, login, getProfile, updateProfile };
