const Application = require("../models/Application");
const Project = require("../models/Project");
const { asyncHandler } = require("../utils/asyncHandler");

const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [createdProjects, sentApplications, receivedApplications] = await Promise.all([
    Project.find({ createdBy: userId }).sort({ createdAt: -1 }).lean(),
    Application.find({ applicant: userId })
      .populate("project", "title createdBy")
      .sort({ createdAt: -1 })
      .lean(),
    Application.find({ owner: userId })
      .populate("project", "title createdBy")
      .populate("applicant", "name email")
      .sort({ createdAt: -1 })
      .lean()
  ]);

  res.json({
    createdProjects,
    sentApplications,
    receivedApplications
  });
});

module.exports = { getDashboard };

