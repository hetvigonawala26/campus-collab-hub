const mongoose = require("mongoose");
const { z } = require("zod");
const Project = require("../models/Project");
const Application = require("../models/Application");
const User = require("../models/User");
const { AppError } = require("../utils/appError");
const { asyncHandler } = require("../utils/asyncHandler");

const objectId = () =>
  z.string().refine((v) => mongoose.Types.ObjectId.isValid(v), "Invalid id");

const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    description: z.string().min(10).max(4000),
    requiredSkills: z.array(z.string().min(1).max(50)).max(50).default([]),
    membersNeeded: z.number().int().min(1).max(50)
  })
});

const updateProjectSchema = z.object({
  params: z.object({ id: objectId() }),
  body: z
    .object({
      title: z.string().min(3).max(120).optional(),
      description: z.string().min(10).max(4000).optional(),
      requiredSkills: z.array(z.string().min(1).max(50)).max(50).optional(),
      membersNeeded: z.number().int().min(1).max(50).optional()
    })
    .refine((b) => Object.keys(b).length > 0, "No fields provided")
});

const listProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ projects });
});

const getProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError("Invalid id", 400);

  const project = await Project.findById(id)
    .populate("createdBy", "name email")
    .populate("teamMembers", "name email")
    .lean();

  if (!project) throw new AppError("Project not found", 404);

  res.json({ project });
});

const createProject = asyncHandler(async (req, res) => {
  const { title, description, requiredSkills, membersNeeded } =
    createProjectSchema.parse({ body: req.body }).body;

  const project = await Project.create({
    title,
    description,
    requiredSkills,
    membersNeeded,
    createdBy: req.user._id,
    teamMembers: [req.user._id]
  });

  await User.updateOne(
    { _id: req.user._id },
    { $addToSet: { createdProjects: project._id } }
  );

  const populated = await Project.findById(project._id)
    .populate("createdBy", "name email")
    .populate("teamMembers", "name email");

  res.status(201).json({ project: populated });
});

const updateProject = asyncHandler(async (req, res) => {
  const parsed = updateProjectSchema.parse({ params: req.params, body: req.body });
  const { id } = parsed.params;

  const project = await Project.findById(id);
  if (!project) throw new AppError("Project not found", 404);
  if (project.createdBy.toString() !== req.user._id.toString())
    throw new AppError("Forbidden", 403);

  Object.assign(project, parsed.body);
  await project.save();

  const populated = await Project.findById(project._id)
    .populate("createdBy", "name email")
    .populate("teamMembers", "name email");

  res.json({ project: populated });
});

const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError("Invalid id", 400);

  const project = await Project.findById(id);
  if (!project) throw new AppError("Project not found", 404);
  if (project.createdBy.toString() !== req.user._id.toString())
    throw new AppError("Forbidden", 403);

  await Application.deleteMany({ project: project._id });
  await User.updateOne({ _id: req.user._id }, { $pull: { createdProjects: project._id } });
  await User.updateMany(
    { appliedProjects: project._id },
    { $pull: { appliedProjects: project._id } }
  );

  await project.deleteOne();
  res.json({ ok: true });
});

module.exports = { listProjects, getProject, createProject, updateProject, deleteProject };
module.exports.schemas = { createProjectSchema, updateProjectSchema };

