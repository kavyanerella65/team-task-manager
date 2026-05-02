const express = require("express");
const { body } = require("express-validator");
const {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember,
  deleteProject,
  getAllUsers,
} = require("../controllers/projectController");
const { protect } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/role");

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/users/all", authorizeRoles("admin"), getAllUsers);

router.get("/", getProjects);

router.post(
  "/",
  authorizeRoles("admin"),
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Project name must be at least 2 characters"),
  ],
  createProject
);

router.get("/:id", getProjectById);

router.post("/:id/members", authorizeRoles("admin"), addMember);

router.delete(
  "/:id/members/:userId",
  authorizeRoles("admin"),
  removeMember
);

router.delete("/:id", authorizeRoles("admin"), deleteProject);

module.exports = router;
