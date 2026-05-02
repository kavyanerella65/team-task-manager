const express = require("express");
const { body } = require("express-validator");
const {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/role");

const router = express.Router();

router.use(protect);

router.get("/project/:projectId", getTasksByProject);

router.post(
  "/",
  authorizeRoles("admin"),
  [
    body("title")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Task title must be at least 2 characters"),
    body("projectId").notEmpty().withMessage("Project ID is required"),
  ],
  createTask
);

// Members can update status; admin can do full update
router.patch("/:id/status", updateTaskStatus);

router.put("/:id", authorizeRoles("admin"), updateTask);

router.delete("/:id", authorizeRoles("admin"), deleteTask);

module.exports = router;
