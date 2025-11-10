const PunchRecord = require('../models/PunchRecord');
const User = require('../models/User');

// Helper function to calculate duration
const calculateDuration = (punchInTime, punchOutTime) => {
  try {
    console.log('calculateDuration called with:', { punchInTime, punchOutTime });
    
    // Parse time strings with am/pm format
    const parseTime = (timeStr) => {
      console.log('Parsing time:', timeStr);
      
      // Remove any extra spaces and convert to 24-hour format
      const cleanTime = timeStr.trim();
      const [time, period] = cleanTime.split(' ');
      const [hours, minutes, seconds] = time.split(':').map(Number);
      
      console.log('Split time parts:', { time, period, hours, minutes, seconds });
      
      let hour24 = hours;
      if (period && period.toLowerCase() === 'pm' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period && period.toLowerCase() === 'am' && hours === 12) {
        hour24 = 0;
      }
      
      console.log('Converted to 24-hour:', hour24);
      
      const result = new Date(2000, 0, 1, hour24, minutes, seconds);
      console.log('Parsed date:', result);
      return result;
    };

    const checkIn = parseTime(punchInTime);
    const checkOut = parseTime(punchOutTime);
    
    const diff = checkOut - checkIn;
    console.log('Time difference in ms:', diff);
    
    // Handle negative duration (punch out before punch in)
    if (diff < 0) {
      return "0h 0m 0s";
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    console.log('Calculated duration parts:', { hours, minutes, seconds });
    
    return `${hours}h ${minutes}m ${seconds}s`;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return "0h 0m 0s";
  }
};

// Helper function to format date and time
const formatDateTime = (date) => {
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString(),
  };
};

// Punch In - Create new punch record
exports.punchIn = async (req, res) => {
  try {
    const { location } = req.body;
    const now = new Date();
    const { date, time } = formatDateTime(now);

    // Check if user already has an active punch record for today
    const existingActiveRecord = await PunchRecord.findOne({
      userId: req.user.id,
      date: date,
      status: 'Active'
    });

    if (existingActiveRecord) {
      return res.status(400).json({ 
        success: false,
        message: 'You already have an active punch record for today. Please punch out first.' 
      });
    }

    const punchRecord = new PunchRecord({
      userId: req.user.id,
      userName: req.user.name,
      date: date,
      punchInTime: time,
      location: location || { lat: null, lon: null },
      status: 'Active'
    });

    await punchRecord.save();

    res.status(201).json({
      success: true,
      message: 'Punched in successfully!',
      data: punchRecord
    });
  } catch (err) {
    console.error('Error in punchIn:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: err.message 
    });
  }
};

// Punch Out - Update existing punch record
exports.punchOut = async (req, res) => {
  try {
    const now = new Date();
    const { date, time } = formatDateTime(now);

    // Find active punch record for today
    const activeRecord = await PunchRecord.findOne({
      userId: req.user.id,
      date: date,
      status: 'Active'
    });

    if (!activeRecord) {
      return res.status(400).json({ 
        success: false,
        message: 'No active punch record found for today. Please punch in first.' 
      });
    }

    // Update the record
    activeRecord.punchOutTime = time;
    
    // Debug logging
    console.log('Calculating duration:');
    console.log('Punch In Time:', activeRecord.punchInTime);
    console.log('Punch Out Time:', time);
    
    const calculatedDuration = calculateDuration(activeRecord.punchInTime, time);
    console.log('Calculated Duration:', calculatedDuration);
    
    activeRecord.duration = calculatedDuration;
    activeRecord.status = 'Completed';
    
    await activeRecord.save();

    res.json({
      success: true,
      message: 'Punched out successfully!',
      data: activeRecord
    });
  } catch (err) {
    console.error('Error in punchOut:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: err.message 
    });
  }
};

// Get user's punch records
exports.getMyPunchRecords = async (req, res) => {
  try {
    const { month, year, date } = req.query;
    let query = { userId: req.user.id };

    // Add date filters if provided
    if (date) {
      query.date = date;
    } else if (month && year) {
      // Filter by month and year
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      // Get all dates in the month
      const datesInMonth = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        datesInMonth.push(d.toLocaleDateString());
      }
      
      query.date = { $in: datesInMonth };
    }

    const punchRecords = await PunchRecord.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email role');

    res.json({
      success: true,
      data: punchRecords
    });
  } catch (err) {
    console.error('Error in getMyPunchRecords:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: err.message 
    });
  }
};

// Admin: Get all punch records
exports.getAllPunchRecords = async (req, res) => {
  try {
    const { month, year, userId, status } = req.query;
    let query = {};

    // Add filters if provided
    if (userId) query.userId = userId;
    if (status) query.status = status;
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const datesInMonth = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        datesInMonth.push(d.toLocaleDateString());
      }
      
      query.date = { $in: datesInMonth };
    }

    const punchRecords = await PunchRecord.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email role');

    res.json({
      success: true,
      data: punchRecords
    });
  } catch (err) {
    console.error('Error in getAllPunchRecords:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: err.message 
    });
  }
};

// Get current punch status
exports.getPunchStatus = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString();
    
    const activeRecord = await PunchRecord.findOne({
      userId: req.user.id,
      date: today,
      status: 'Active'
    });

    res.json({
      success: true,
      isPunchedIn: !!activeRecord,
      currentRecord: activeRecord
    });
  } catch (err) {
    console.error('Error in getPunchStatus:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: err.message 
    });
  }
};

// Update punch record (Admin only)
exports.updatePunchRecord = async (req, res) => {
  try {
    const { punchInTime, punchOutTime, remarks } = req.body;
    
    const punchRecord = await PunchRecord.findById(req.params.id);
    if (!punchRecord) {
      return res.status(404).json({ 
        success: false,
        message: 'Punch record not found' 
      });
    }

    // Update fields if provided
    if (punchInTime !== undefined) punchRecord.punchInTime = punchInTime;
    if (punchOutTime !== undefined) punchRecord.punchOutTime = punchOutTime;
    if (remarks !== undefined) punchRecord.remarks = remarks;

    // Recalculate duration if both times are provided
    if (punchInTime && punchOutTime) {
      punchRecord.duration = calculateDuration(punchInTime, punchOutTime);
      punchRecord.status = 'Completed';
    }

    await punchRecord.save();

    res.json({
      success: true,
      message: 'Punch record updated successfully',
      data: punchRecord
    });
  } catch (err) {
    console.error('Error in updatePunchRecord:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: err.message 
    });
  }
};

// Delete punch record (Admin only)
exports.deletePunchRecord = async (req, res) => {
  try {
    const punchRecord = await PunchRecord.findById(req.params.id);
    if (!punchRecord) {
      return res.status(404).json({ 
        success: false,
        message: 'Punch record not found' 
      });
    }

    await punchRecord.deleteOne();

    res.json({
      success: true,
      message: 'Punch record deleted successfully'
    });
  } catch (err) {
    console.error('Error in deletePunchRecord:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: err.message 
    });
  }
};

// Get total time worked for a specific day
exports.getTotalTimeForDay = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toLocaleDateString();
    
    const records = await PunchRecord.find({ 
      userId: req.user.id, 
      date: targetDate,
      status: 'Completed'
    });
    
    let totalMinutes = 0;
    
    records.forEach(record => {
      if (record.duration && record.duration !== '-') {
        // Parse duration string like "2h 30m 15s"
        const durationMatch = record.duration.match(/(\d+)h\s*(\d+)m\s*(\d+)s/);
        if (durationMatch) {
          const hours = parseInt(durationMatch[1]) || 0;
          const minutes = parseInt(durationMatch[2]) || 0;
          const seconds = parseInt(durationMatch[3]) || 0;
          totalMinutes += hours * 60 + minutes + seconds / 60;
        }
      }
    });
    
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = Math.floor(totalMinutes % 60);
    const remainingSeconds = Math.floor((totalMinutes % 1) * 60);
    
    const totalTime = `${totalHours}h ${remainingMinutes}m ${remainingSeconds}s`;
    
    res.json({
      success: true,
      data: {
        date: targetDate,
        totalTime,
        totalMinutes: Math.floor(totalMinutes),
        sessionCount: records.length,
        records: records
      }
    });
  } catch (error) {
    console.error('Error getting total time for day:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting total time for day.'
    });
  }
};
