const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  punchIn: { type: Date },
  punchOut: { type: Date }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
