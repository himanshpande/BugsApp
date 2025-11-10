const mongoose = require("mongoose");

const salaryRecordSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Credited"],
    default: "Credited", // since you’re just marking it as recorded
  },
  remarks: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SalaryRecord", salaryRecordSchema);
