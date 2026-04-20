const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    createdProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    appliedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

