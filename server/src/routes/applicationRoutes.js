const express = require("express");
const {
  applyToProject,
  acceptApplication,
  rejectApplication
} = require("../controllers/applicationController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/applications/:projectId
router.post("/:projectId", requireAuth, applyToProject);

// PATCH /api/applications/:id/accept
router.patch("/:id/accept", requireAuth, acceptApplication);

// PATCH /api/applications/:id/reject
router.patch("/:id/reject", requireAuth, rejectApplication);

module.exports = router;

