const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    requiredSkills: [{ type: String, trim: true }],
    membersNeeded: { type: Number, required: true, min: 1, max: 50 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

projectSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model("Project", projectSchema);

