import mongoose from "mongoose";

const bugSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved"],
    default: "Open",
  },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const Bug = mongoose.model("Bug", bugSchema);
export default Bug;
