const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true
    }
  },
  { timestamps: true }
);

applicationSchema.index({ project: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);

