const { validationResult } = require("express-validator");
const Task = require("../models/Task");
const Project = require("../models/Project");

// Helper: check if user has access to project
const userHasProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { access: false, project: null };
  const isMember = project.members.some((m) => m.toString() === userId.toString());
  return { access: isMember, project };
};

// @desc    Create a task in a project
// @route   POST /api/tasks
// @access  Admin only
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, projectId, assignedTo, dueDate } = req.body;

    const { access, project } = await userHasProjectAccess(projectId, req.user._id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!access) return res.status(403).json({ message: "Access denied" });

    if (assignedTo) {
      const isProjectMember = project.members.some(
        (m) => m.toString() === assignedTo
      );
      if (!isProjectMember) {
        return res
          .status(400)
          .json({ message: "Assigned user is not a project member" });
      }
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      dueDate: dueDate || null,
    });

    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private (project members)
const getTasksByProject = async (req, res) => {
  try {
    const { access, project } = await userHasProjectAccess(
      req.params.projectId,
      req.user._id
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!access) return res.status(403).json({ message: "Access denied" });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update task status (members can ONLY update status)
// @route   PATCH /api/tasks/:id/status
// @access  Private (member: status only, admin: full update)
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["todo", "in-progress", "done"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { access } = await userHasProjectAccess(task.project, req.user._id);
    if (!access) return res.status(403).json({ message: "Access denied" });

    task.status = status;
    await task.save();
    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update full task (admin only)
// @route   PUT /api/tasks/:id
// @access  Admin only
const updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, status } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { access, project } = await userHasProjectAccess(
      task.project,
      req.user._id
    );
    if (!access) return res.status(403).json({ message: "Access denied" });

    if (assignedTo) {
      const isProjectMember = project.members.some(
        (m) => m.toString() === assignedTo
      );
      if (!isProjectMember) {
        return res
          .status(400)
          .json({ message: "Assigned user is not a project member" });
      }
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (status) task.status = status;

    await task.save();
    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Admin only
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { access } = await userHasProjectAccess(task.project, req.user._id);
    if (!access) return res.status(403).json({ message: "Access denied" });

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
