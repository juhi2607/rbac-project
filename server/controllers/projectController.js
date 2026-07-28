const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const createAuditLog = require('../utils/auditLogger');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all projects (role-filtered)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Managers only see projects they manage or are members of
    if (req.user.role === 'Manager') {
      query.$or = [{ manager: req.user._id }, { members: req.user._id }];
    }

    // Regular users only see projects they are members of
    if (req.user.role === 'User') {
      query.members = req.user._id;
    }

    // Search by title
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by manager (Admin only)
    if (req.query.manager && req.user.role === 'Admin') {
      query.manager = req.query.manager;
    }

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('manager', 'name email')
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, 200, 'Projects fetched successfully', {
      projects,
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

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email role')
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    // Access control: Managers/Users can only view their own projects
    if (req.user.role === 'Manager') {
      const isManager = project.manager && project.manager._id.toString() === req.user._id.toString();
      const isMember = project.members.some((m) => m._id.toString() === req.user._id.toString());
      if (!isManager && !isMember) {
        return sendError(res, 403, 'Access denied. You are not part of this project.');
      }
    }

    if (req.user.role === 'User') {
      const isMember = project.members.some((m) => m._id.toString() === req.user._id.toString());
      if (!isMember) {
        return sendError(res, 403, 'Access denied. You are not part of this project.');
      }
    }

    // Get task summary for this project
    const taskStats = await Task.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return sendSuccess(res, 200, 'Project fetched successfully', { project, taskStats });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Create project (Admin only)
// @route   POST /api/projects
// @access  Admin
const createProject = async (req, res) => {
  try {
    const { title, description, status, priority, manager, deadline, members } = req.body;

    // Validate manager if provided
    if (manager) {
      const managerUser = await User.findById(manager);
      if (!managerUser) {
        return sendError(res, 404, 'Manager user not found');
      }
      if (!['Manager', 'Admin'].includes(managerUser.role)) {
        return sendError(res, 400, 'Assigned manager must have Manager or Admin role');
      }
    }

    const project = await Project.create({
      title,
      description,
      status,
      priority,
      manager: manager || null,
      members: members || [],
      deadline,
      createdBy: req.user._id,
    });

    await project.populate('manager', 'name email');
    await project.populate('createdBy', 'name email');

    await createAuditLog({
      action: `Project created: "${project.title}"`,
      entity: 'Project',
      entityId: project._id,
      performedBy: req.user._id,
      details: { title: project.title, status: project.status },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 201, 'Project created successfully', { project });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Update project (Admin only)
// @route   PUT /api/projects/:id
// @access  Admin
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    const { title, description, status, priority, manager, deadline, members } = req.body;

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (priority !== undefined) project.priority = priority;
    if (manager !== undefined) project.manager = manager || null;
    if (deadline !== undefined) project.deadline = deadline;
    if (members !== undefined) project.members = members;

    await project.save();
    await project.populate('manager', 'name email');
    await project.populate('createdBy', 'name email');
    await project.populate('members', 'name email');

    await createAuditLog({
      action: `Project updated: "${project.title}"`,
      entity: 'Project',
      entityId: project._id,
      performedBy: req.user._id,
      details: { changes: req.body },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Project updated successfully', { project });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Delete project (Admin only)
// @route   DELETE /api/projects/:id
// @access  Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    await createAuditLog({
      action: `Project deleted: "${project.title}"`,
      entity: 'Project',
      entityId: project._id,
      performedBy: req.user._id,
      details: { title: project.title },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Project and all associated tasks deleted successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/projects/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    let projectQuery = {};
    let taskQuery = {};

    if (req.user.role === 'Manager') {
      projectQuery.$or = [{ manager: req.user._id }, { members: req.user._id }];
    }
    if (req.user.role === 'User') {
      taskQuery.assignedTo = req.user._id;
    }

    const [totalProjects, totalTasks, totalUsers, projectsByStatus, tasksByStatus, recentProjects] =
      await Promise.all([
        Project.countDocuments(projectQuery),
        Task.countDocuments(req.user.role === 'User' ? taskQuery : {}),
        req.user.role === 'Admin' ? User.countDocuments() : Promise.resolve(null),
        Project.aggregate([
          { $match: projectQuery },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Task.aggregate([
          { $match: req.user.role === 'User' ? taskQuery : {} },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Project.find(projectQuery)
          .populate('manager', 'name')
          .sort({ createdAt: -1 })
          .limit(5)
          .select('title status priority createdAt'),
      ]);

    return sendSuccess(res, 200, 'Dashboard stats fetched', {
      totalProjects,
      totalTasks,
      totalUsers,
      projectsByStatus,
      tasksByStatus,
      recentProjects,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject, getDashboardStats };
