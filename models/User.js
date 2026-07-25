import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,

  // ⭐ ADD THIS
  appliedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: []
    }
  ],

  savedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: []
    }
  ]
});

export default mongoose.model("User", userSchema);