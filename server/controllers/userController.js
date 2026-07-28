const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const createAuditLog = require('../utils/auditLogger');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all users (with pagination, search, filter)
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Search by name or email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Filter by role
    if (req.query.role && ['Admin', 'Manager', 'User'].includes(req.query.role)) {
      query.role = req.query.role;
    }

    // Filter by status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, 200, 'Users fetched successfully', {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    return sendSuccess(res, 200, 'User fetched successfully', { user });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Create a new user (Admin only)
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'User with this email already exists');
    }

    const user = await User.create({ name, email, password, role });

    await createAuditLog({
      action: `Admin created user: ${user.name} (${user.role})`,
      entity: 'User',
      entityId: user._id,
      performedBy: req.user._id,
      details: { name: user.name, email: user.email, role: user.role },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 201, 'User created successfully', { user });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === req.params.id && isActive === false) {
      return sendError(res, 400, 'You cannot deactivate your own account');
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    await createAuditLog({
      action: `Admin updated user: ${user.name}`,
      entity: 'User',
      entityId: user._id,
      performedBy: req.user._id,
      details: { changes: req.body },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'User updated successfully', { user });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return sendError(res, 400, 'You cannot delete your own account');
    }

    await User.findByIdAndDelete(req.params.id);

    // Unassign deleted user from tasks and projects
    await Task.updateMany({ assignedTo: req.params.id }, { $set: { assignedTo: null } });
    await Project.updateMany({ manager: req.params.id }, { $set: { manager: null } });
    await Project.updateMany({ members: req.params.id }, { $pull: { members: req.params.id } });

    await createAuditLog({
      action: `Admin deleted user: ${user.name} (${user.email})`,
      entity: 'User',
      entityId: user._id,
      performedBy: req.user._id,
      details: { name: user.name, email: user.email, role: user.role },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'User deleted successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get all managers (for dropdowns)
// @route   GET /api/users/managers
// @access  Admin
const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: { $in: ['Manager', 'Admin'] }, isActive: true })
      .select('_id name email role')
      .sort({ name: 1 });
    return sendSuccess(res, 200, 'Managers fetched successfully', { managers });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, getManagers };
