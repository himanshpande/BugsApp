const Attendance = require('../models/Attendance');

// Get today's attendance for the logged-in user
exports.getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    const record = await Attendance.findOne({
      user: req.user.id,
      date: { $gte: startOfDay },
    });

    res.json(record || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Punch in
exports.punchIn = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    let record = await Attendance.findOne({
      user: req.user.id,
      date: { $gte: startOfDay },
    });

    if (record && record.punchIn) {
      return res.status(400).json({ message: 'Already punched in today' });
    }

    if (!record) {
      record = new Attendance({ user: req.user.id });
    }

    record.punchIn = new Date();
    await record.save();

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Punch out
exports.punchOut = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    const record = await Attendance.findOne({
      user: req.user.id,
      date: { $gte: startOfDay },
    });

    if (!record || !record.punchIn) {
      return res.status(400).json({ message: 'Punch in first' });
    }

    if (record.punchOut) {
      return res.status(400).json({ message: 'Already punched out' });
    }

    record.punchOut = new Date();
    await record.save();

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
