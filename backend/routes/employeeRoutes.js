const express = require('express');
const Employee = require('../models/Employee');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create or Update Employee
router.post("/save", authMiddleware(), async (req, res) => {
  try {
    const { employeeId } = req.body;
    const userId = req.body.userId || req.user.id.toString();

    console.log("Saving employee with data:", { userId, employeeId, ...req.body });
    
    // First try to find by userId
    let existing = await Employee.findOne({ userId });
    let employee;
    
    if (existing) {
      console.log("Updating existing employee by userId:", existing._id);
      // Update existing employee
      employee = await Employee.findOneAndUpdate(
        { _id: existing._id }, 
        req.body, 
        { new: true, runValidators: true }
      );
    } else {
      // Check if employeeId already exists for a different user
      if (employeeId) {
        const existingByEmployeeId = await Employee.findOne({ employeeId });
        if (existingByEmployeeId && existingByEmployeeId.userId !== userId) {
          return res.status(400).json({ 
            success: false, 
            message: `Employee ID "${employeeId}" is already taken by another user. Please use a different Employee ID.` 
          });
        }
      }
      
      console.log("Creating new employee");
      // Create new employee
      const payload = {
        ...req.body,
        userId,
      };

      employee = new Employee(payload);
      await employee.save();
    }

    console.log("Employee saved successfully:", employee._id);
    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    console.error("Error saving employee:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      code: err.code,
      keyValue: err.keyValue
    });
    
    // Handle specific MongoDB errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ 
        success: false, 
        message: `${field} already exists. Please use a different ${field}.` 
      });
    }
    
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get logged-in user's employee info
router.get("/my-info", authMiddleware(), async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: employee });
  } catch (err) {
    console.error("Error fetching my-info:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Employee by ID
router.get("/:employeeId", async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.employeeId });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Employee by User ID
router.get("/user/:userId", async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.params.userId });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all employees (for admin)
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Alternative route for admin employee management
router.get("/admin/list", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json({ success: true, data: employees });
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Test route to verify employee routes are working
router.get("/test", async (req, res) => {
  try {
    res.json({ success: true, message: "Employee routes are working!", timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all employees with user details (for admin)
router.get("/admin/all", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    
    // Get all unique user IDs from employees
    const userIds = [...new Set(employees.map(emp => emp.userId))];
    
    // Fetch user details for all userIds
    const User = require('../models/User');
    const users = await User.find({ _id: { $in: userIds } });
    
    // Create a map of userId to user data
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });
    
    // Attach user data to employees
    const employeesWithUsers = employees.map(employee => ({
      ...employee.toObject(),
      userId: userMap[employee.userId] || { name: 'Unknown User', email: 'N/A', role: 'Unknown' }
    }));
    
    res.json({ success: true, data: employeesWithUsers });
  } catch (err) {
    console.error("Error fetching employees with users:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update employee by ID (admin)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove userId and userName from update data to prevent conflicts
    delete updateData.userId;
    delete updateData.userName;
    
    const employee = await Employee.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    
    res.json({ success: true, data: employee });
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete employee by ID (admin)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Employee.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete employee by user ID
router.delete("/user/:userId", async (req, res) => {
  try {
    const result = await Employee.findOneAndDelete({ userId: req.params.userId });
    if (!result) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
