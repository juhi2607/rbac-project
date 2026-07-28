const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const createAuditLog = require('../utils/auditLogger');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all tasks (role-filtered, paginated)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Users only see tasks assigned to them
    if (req.user.role === 'User') {
      query.assignedTo = req.user._id;
    }

    // Filter by project
    if (req.query.project) {
      query.project = req.query.project;

      // Managers: verify they manage or are members of this project
      if (req.user.role === 'Manager') {
        const project = await Project.findById(req.query.project);
        if (!project) return sendError(res, 404, 'Project not found');
        const isManager = project.manager && project.manager.toString() === req.user._id.toString();
        const isMember = project.members.some((m) => m.toString() === req.user._id.toString());
        if (!isManager && !isMember) {
          return sendError(res, 403, 'Access denied to this project');
        }
      }
    }

    // Search by title
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by priority
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Filter by assignee (Admin/Manager)
    if (req.query.assignedTo && req.user.role !== 'User') {
      query.assignedTo = req.query.assignedTo;
    }

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('project', 'title status')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, 200, 'Tasks fetched successfully', {
      tasks,
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

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title status manager members')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    // Users can only view tasks assigned to them
    if (req.user.role === 'User') {
      if (!task.assignedTo || task.assignedTo._id.toString() !== req.user._id.toString()) {
        return sendError(res, 403, 'Access denied. This task is not assigned to you.');
      }
    }

    return sendSuccess(res, 200, 'Task fetched successfully', { task });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Create task (Manager, Admin)
// @route   POST /api/tasks
// @access  Manager, Admin
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, project, assignedTo, deadline } = req.body;

    // Verify project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return sendError(res, 404, 'Project not found');
    }

    // Manager can only create tasks in their own projects
    if (req.user.role === 'Manager') {
      const isManager = projectDoc.manager && projectDoc.manager.toString() === req.user._id.toString();
      const isMember = projectDoc.members.some((m) => m.toString() === req.user._id.toString());
      if (!isManager && !isMember) {
        return sendError(res, 403, 'You can only create tasks in projects you manage');
      }
    }

    // Validate assignee if provided
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee) {
        return sendError(res, 404, 'Assigned user not found');
      }
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'Todo',
      priority: priority || 'Medium',
      project,
      assignedTo: assignedTo || null,
      deadline,
      createdBy: req.user._id,
    });

    await task.populate('project', 'title');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    await createAuditLog({
      action: `Task created: "${task.title}" in project "${projectDoc.title}"`,
      entity: 'Task',
      entityId: task._id,
      performedBy: req.user._id,
      details: { title: task.title, project: projectDoc.title, assignedTo },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 201, 'Task created successfully', { task });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Update task (Manager, Admin)
// @route   PUT /api/tasks/:id
// @access  Manager, Admin
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'manager members title');
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    // Manager can only update tasks in their projects
    if (req.user.role === 'Manager') {
      const isManager = task.project.manager && task.project.manager.toString() === req.user._id.toString();
      const isMember = task.project.members.some((m) => m.toString() === req.user._id.toString());
      if (!isManager && !isMember) {
        return sendError(res, 403, 'You can only update tasks in projects you manage');
      }
    }

    const { title, description, status, priority, assignedTo, deadline } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (deadline !== undefined) task.deadline = deadline;

    await task.save();
    await task.populate('project', 'title status');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    await createAuditLog({
      action: `Task updated: "${task.title}"`,
      entity: 'Task',
      entityId: task._id,
      performedBy: req.user._id,
      details: { changes: req.body },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Task updated successfully', { task });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Update task status (User can only do this on their tasks)
// @route   PATCH /api/tasks/:id/status
// @access  Private (all roles, with restrictions)
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    // Users can only update status of tasks assigned to them
    if (req.user.role === 'User') {
      if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
        return sendError(res, 403, 'You can only update status of tasks assigned to you');
      }
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    await createAuditLog({
      action: `Task status changed: "${task.title}" → ${oldStatus} to ${status}`,
      entity: 'Task',
      entityId: task._id,
      performedBy: req.user._id,
      details: { oldStatus, newStatus: status },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Task status updated successfully', { task });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Delete task (Manager, Admin)
// @route   DELETE /api/tasks/:id
// @access  Manager, Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'manager members title');
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    // Manager can only delete tasks in their projects
    if (req.user.role === 'Manager') {
      const isManager = task.project.manager && task.project.manager.toString() === req.user._id.toString();
      const isMember = task.project.members.some((m) => m.toString() === req.user._id.toString());
      if (!isManager && !isMember) {
        return sendError(res, 403, 'You can only delete tasks in projects you manage');
      }
    }

    await Task.findByIdAndDelete(req.params.id);

    await createAuditLog({
      action: `Task deleted: "${task.title}"`,
      entity: 'Task',
      entityId: task._id,
      performedBy: req.user._id,
      details: { title: task.title, project: task.project.title },
      ipAddress: req.ip,
    });

    return sendSuccess(res, 200, 'Task deleted successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, updateTaskStatus, deleteTask };
