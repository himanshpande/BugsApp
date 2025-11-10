const Salary = require('../models/Salary');
const User = require('../models/User');

// Get all salary records
exports.getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate('staffId', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });
    res.json(salaries);
  } catch (err) {
    console.error('Error fetching salaries:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create new salary record
exports.createSalary = async (req, res) => {
  try {
    const { staffId, month, year, amount, remarks } = req.body;
    
    // Validate staff exists
    const staff = await User.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check if salary already exists for this staff member for this month/year
    const existingSalary = await Salary.findOne({ 
      staffId, 
      month: parseInt(month), 
      year: parseInt(year) 
    });
    
    if (existingSalary) {
      return res.status(400).json({ 
        message: 'Salary record already exists for this staff member for this month/year' 
      });
    }

    const salary = new Salary({
      staffId,
      month: parseInt(month),
      year: parseInt(year),
      amount: parseFloat(amount),
      remarks: remarks || '',
      createdBy: req.user.id
    });

    await salary.save();
    await salary.populate('staffId', 'name email role');
    await salary.populate('createdBy', 'name email role');
    
    res.status(201).json(salary);
  } catch (err) {
    console.error('Error creating salary:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update salary record
exports.updateSalary = async (req, res) => {
  try {
    const { amount, status, remarks } = req.body;
    
    const salary = await Salary.findById(req.params.id);
    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    // Only Admin can update salary records
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized. Only Admin can update salary records.' });
    }

    if (amount !== undefined) salary.amount = parseFloat(amount);
    if (status !== undefined) salary.status = status;
    if (remarks !== undefined) salary.remarks = remarks;

    await salary.save();
    await salary.populate('staffId', 'name email role');
    await salary.populate('createdBy', 'name email role');
    
    res.json(salary);
  } catch (err) {
    console.error('Error updating salary:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete salary record
exports.deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);
    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    // Only Admin can delete salary records
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized. Only Admin can delete salary records.' });
    }

    await salary.deleteOne();
    res.json({ message: 'Salary record deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('Error deleting salary:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get salary records for a specific staff member
exports.getStaffSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find({ staffId: req.params.staffId })
      .populate('staffId', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ year: -1, month: -1 });
    res.json(salaries);
  } catch (err) {
    console.error('Error fetching staff salaries:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get current user's own salary records (for Dev/Tester users)
exports.getMySalaries = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { staffId: req.user.id };
    
    // Add month filter if provided
    if (month) {
      query.month = parseInt(month);
    }
    
    // Add year filter if provided
    if (year) {
      query.year = parseInt(year);
    }
    
    const salaries = await Salary.find(query)
      .populate('staffId', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ year: -1, month: -1 });
    
    res.json(salaries);
  } catch (err) {
    console.error('Error fetching user salaries:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};