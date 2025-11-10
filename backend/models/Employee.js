const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: String,
  firstName: String,
  lastName: String,
  employeeId: { type: String, unique: true },
  email: String,
  phone: String,
  dob: String,
  gender: String,
  address: String,
  department: String,
  role: String,
  startDate: String,
  employmentType: String,
  emergencyContact: String,
  bankAccount: String,
  avatarDataUrl: String,
  documents: [
    {
      name: String,
      dataUrl: String,
    },
  ],
}, { timestamps: true });

// Check if model already exists
const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

module.exports = Employee;