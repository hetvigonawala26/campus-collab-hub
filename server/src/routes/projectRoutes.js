const express = require("express");
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require("../controllers/projectController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", listProjects);
router.get("/:id", getProject);
router.post("/", requireAuth, createProject);
router.put("/:id", requireAuth, updateProject);
router.delete("/:id", requireAuth, deleteProject);

module.exports = router;

