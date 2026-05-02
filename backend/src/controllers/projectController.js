const { validationResult } = require("express-validator");
const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");

// @desc    Create a new project
// @route   POST /api/projects
// @access  Admin only
const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });

    await project.populate("owner", "name email");

    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
      .populate("owner", "name email")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private (must be member or owner)
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    const isOwner = project.owner._id.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Add a member to a project
// @route   POST /api/projects/:id/members
// @access  Admin only
const addMember = async (req, res) => {
  try {
    const { email } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the project owner can add members" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with that email" });
    }

    const alreadyMember = project.members.some(
      (m) => m.toString() === user._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    project.members.push(user._id);
    await project.save();
    await project.populate("members", "name email role");

    res.json({ message: "Member added successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Remove a member from a project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Admin only
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the project owner can remove members" });
    }

    if (req.params.userId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Owner cannot be removed from the project" });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();
    await project.populate("members", "name email role");

    res.json({ message: "Member removed successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Admin only
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the project owner can delete it" });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all members (for adding to projects)
// @route   GET /api/projects/users/all
// @access  Admin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "name email role"
    );
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember,
  deleteProject,
  getAllUsers,
};
