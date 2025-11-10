const mongoose = require('mongoose');

const punchRecordSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userName: { 
    type: String, 
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  punchInTime: { 
    type: String, 
    required: true 
  },
  punchOutTime: { 
    type: String, 
    default: "-" 
  },
  duration: { 
    type: String, 
    default: "-" 
  },
  location: {
    lat: { type: Number, default: null },
    lon: { type: Number, default: null }
  },
  status: { 
    type: String, 
    enum: ['Active', 'Completed'], 
    default: 'Active' 
  },
  remarks: { 
    type: String, 
    default: "" 
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
punchRecordSchema.index({ userId: 1, date: 1 });
punchRecordSchema.index({ status: 1 });

module.exports = mongoose.model('PunchRecord', punchRecordSchema);

