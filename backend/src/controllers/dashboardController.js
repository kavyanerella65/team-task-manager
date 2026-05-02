const Task = require("../models/Task");
const Project = require("../models/Project");

// @desc    Get dashboard stats for current user
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    let projectFilter, taskFilter;

    if (req.user.role === "admin") {
      // Admin sees stats for their own projects
      const ownedProjects = await Project.find({
        owner: req.user._id,
      }).select("_id");
      const projectIds = ownedProjects.map((p) => p._id);

      projectFilter = { owner: req.user._id };
      taskFilter = { project: { $in: projectIds } };
    } else {
      // Member sees stats for their assigned tasks
      const memberProjects = await Project.find({
        members: req.user._id,
      }).select("_id");
      const projectIds = memberProjects.map((p) => p._id);

      projectFilter = { members: req.user._id };
      taskFilter = {
        project: { $in: projectIds },
        assignedTo: req.user._id,
      };
    }

    const [
      totalProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      recentTasks,
    ] = await Promise.all([
      Project.countDocuments(projectFilter),
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: "done" }),
      Task.countDocuments({ ...taskFilter, status: "in-progress" }),
      Task.countDocuments({ ...taskFilter, status: "todo" }),
      Task.countDocuments({
        ...taskFilter,
        status: { $ne: "done" },
        dueDate: { $lt: now, $ne: null },
      }),
      Task.find({
        ...taskFilter,
        status: { $ne: "done" },
        dueDate: { $lt: now, $ne: null },
      })
        .populate("assignedTo", "name email")
        .populate("project", "name")
        .sort({ dueDate: 1 })
        .limit(5),
    ]);

    res.json({
      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overdueTasks,
      },
      overdueTasksList: recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getDashboardStats };
