import Employee from "../models/Employee.js";

/**
 * @desc Create or Update Employee
 * @route POST /api/employees/save
 * @access Public (you can later secure this)
 */
export const saveEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    let employee = await Employee.findOne({ employeeId });

    if (employee) {
      // update existing
      employee = await Employee.findOneAndUpdate({ employeeId }, req.body, { new: true });
    } else {
      // create new
      employee = new Employee(req.body);
      await employee.save();
    }

    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    console.error("Error saving employee:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Get Employee by employeeId
 * @route GET /api/employees/:employeeId
 * @access Public (you can restrict later)
 */
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.employeeId });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    res.json({ success: true, data: employee });
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Get Employee by user ID
 * @route GET /api/employees/user/:userId
 * @access Private
 */
export const getEmployeeByUserId = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.params.userId });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    res.json({ success: true, data: employee });
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Get all employees (for admin dashboard)
 * @route GET /api/employees
 */
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Delete Employee
 * @route DELETE /api/employees/:employeeId
 */
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({ employeeId: req.params.employeeId });
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
