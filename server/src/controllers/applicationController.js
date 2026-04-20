const mongoose = require("mongoose");
const Project = require("../models/Project");
const Application = require("../models/Application");
const User = require("../models/User");
const { AppError } = require("../utils/appError");
const { asyncHandler } = require("../utils/asyncHandler");

const applyToProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(projectId)) throw new AppError("Invalid id", 400);

  const project = await Project.findById(projectId);
  if (!project) throw new AppError("Project not found", 404);

  if (project.createdBy.toString() === req.user._id.toString()) {
    throw new AppError("You cannot apply to your own project", 400);
  }

  const alreadyTeam = project.teamMembers.some(
    (id) => id.toString() === req.user._id.toString()
  );
  if (alreadyTeam) throw new AppError("You are already a team member", 400);

  try {
    const app = await Application.create({
      project: project._id,
      applicant: req.user._id,
      owner: project.createdBy,
      status: "pending"
    });

    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { appliedProjects: project._id } }
    );

    const populated = await Application.findById(app._id)
      .populate("project", "title createdBy membersNeeded teamMembers")
      .populate("applicant", "name email")
      .populate("owner", "name email");

    res.status(201).json({ application: populated });
  } catch (err) {
    if (err && err.code === 11000) {
      throw new AppError("You already applied to this project", 409);
    }
    throw err;
  }
});

const acceptApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError("Invalid id", 400);

  const application = await Application.findById(id);
  if (!application) throw new AppError("Application not found", 404);

  if (application.owner.toString() !== req.user._id.toString()) {
    throw new AppError("Forbidden", 403);
  }

  if (application.status !== "pending") {
    throw new AppError("Only pending applications can be accepted", 400);
  }

  const project = await Project.findById(application.project);
  if (!project) throw new AppError("Project not found", 404);

  const teamSet = new Set(project.teamMembers.map((m) => m.toString()));
  teamSet.add(application.applicant.toString());
  project.teamMembers = Array.from(teamSet);

  const maxMembers = project.membersNeeded + 1; // include owner (owner is in teamMembers)
  if (project.teamMembers.length > maxMembers) {
    throw new AppError("Project is already full", 400);
  }

  application.status = "accepted";
  await Promise.all([project.save(), application.save()]);

  const populated = await Application.findById(application._id)
    .populate("project", "title createdBy membersNeeded teamMembers")
    .populate("applicant", "name email")
    .populate("owner", "name email");

  res.json({ application: populated });
});

const rejectApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError("Invalid id", 400);

  const application = await Application.findById(id);
  if (!application) throw new AppError("Application not found", 404);

  if (application.owner.toString() !== req.user._id.toString()) {
    throw new AppError("Forbidden", 403);
  }

  if (application.status !== "pending") {
    throw new AppError("Only pending applications can be rejected", 400);
  }

  application.status = "rejected";
  await application.save();

  const populated = await Application.findById(application._id)
    .populate("project", "title createdBy membersNeeded teamMembers")
    .populate("applicant", "name email")
    .populate("owner", "name email");

  res.json({ application: populated });
});

module.exports = { applyToProject, acceptApplication, rejectApplication };

