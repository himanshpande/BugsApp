import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Table, Modal, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import SalaryManagement from "./SalaryManagement"; 
import { Alert } from "@mui/material";
import { useNotification } from "./NotificationProvider";



export default function Dashboard() {
  const { showNotification } = useNotification();
  const [workItems, setWorkItems] = useState([]);
  const [selectedWorkItem, setSelectedWorkItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [activeSection, setActiveSection] = useState("workitems");
  const [editUser, setEditUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");

  // Salary Management States
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [salaryStaffList, setSalaryStaffList] = useState([]);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryError, setSalaryError] = useState(null);
  const [salaryFilters, setSalaryFilters] = useState({
    month: "",
    year: "",
  });
  const [salaryFormData, setSalaryFormData] = useState({
    staffId: "",
    month: "",
    year: "",
    amount: "",
    remarks: "",
  });

  // Attendance Management States
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [attendanceFilters, setAttendanceFilters] = useState({
    month: "",
    year: "",
    date: "",
  });
  const [attendanceFormData, setAttendanceFormData] = useState({
    date: "",
    checkIn: "",
    checkOut: "",
    status: "Present",
    remarks: "",
  });

  // Employee Personal Info States
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Admin Employee Management States
  const [allEmployees, setAllEmployees] = useState([]);
  const [employeeManagementLoading, setEmployeeManagementLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeEditMode, setEmployeeEditMode] = useState(false);
  const [employeeFormData, setEmployeeFormData] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    department: "",
    role: "",
    startDate: "",
    employmentType: "",
    emergencyContact: "",
    bankAccount: "",
    avatarDataUrl: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  
  // Debug: Log user object to console
  console.log("User object from localStorage:", user);

  // ====================== FETCH WORK ITEMS ======================
  const fetchWorkItems = async () => {
    try {
      const url =
        user.role === "Admin"
          ? "http://localhost:5000/api/workitems"
          : "http://localhost:5000/api/workitems/my";
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkItems(res.data);
    } catch (err) {
      console.error("Failed to fetch work items", err);
    }
  };

  // ====================== FETCH USERS ======================
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchWorkItems();
    if (user.role === "Admin") fetchUsers();
  }, []);

  // ====================== WORK ITEM FUNCTIONS ======================
  const handleEdit = (item) => {
    const workItemToEdit = {
      ...item,
      assignedTo:
        typeof item.assignedTo === "object"
          ? item.assignedTo._id
          : item.assignedTo,
      createdBy:
        typeof item.createdBy === "object"
          ? item.createdBy._id
          : item.createdBy,
    };
    setSelectedWorkItem(workItemToEdit);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedWorkItem({
      title: "",
      description: "",
      priority: "Medium",
      status: "Pending",
      assignedTo: "",
    });
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (isEditMode) {
        const res = await axios.put(
          `http://localhost:5000/api/workitems/${selectedWorkItem._id}`,
          selectedWorkItem,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      setWorkItems((prev) =>
        prev.map((w) => (w._id === res.data._id ? res.data : w))
      );
      showNotification({
        type: "success",
        message: "Work item updated successfully!"
      });
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/workitems",
          { ...selectedWorkItem, createdBy: user._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWorkItems((prev) => [...prev, res.data]);
        showNotification({
          type: "success",
          message: "Work item created successfully!"
        });
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error saving work item", err);
      showNotification({
        type: "error",
        message: "Failed to save work item"
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this work item?"))
      return;

    try {
      await axios.delete(`http://localhost:5000/api/workitems/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkItems((prev) => prev.filter((item) => item._id !== id));
      showNotification({
        type: "success",
        message: "Work item deleted successfully!"
      });
    } catch (err) {
      console.error("Error deleting work item", err);
      showNotification({
        type: "error",
        message: "Failed to delete work item"
      });
    }
  };

  // ====================== USER MANAGEMENT ======================
  const handleRoleEdit = (u) => {
    setEditUser(u);
    setShowUserModal(true);
  };

  const handleRoleSave = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/auth/users/${editUser._id}/role`,
        { role: editUser.role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === res.data.user._id ? res.data.user : u))
      );
      setShowUserModal(false);
      showNotification({
        type: "success",
        message: "User role updated successfully!"
      });
    } catch (err) {
      console.error("Failed to update user role", err);
      showNotification({
        type: "error",
        message: "Failed to update role"
      });
    }
  };

  // ====================== COMMENTS SECTION ======================
  const fetchComments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/comments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const mentionedUserIds = users
        .filter((u) => newComment.includes(`@${u.name}`))
        .map((u) => u._id);

      const res = await axios.post(
        "http://localhost:5000/api/comments",
        { text: newComment, mentionedUserIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [res.data, ...prev]);
      setNewComment("");
      showNotification({
        type: "success",
        message: "Comment added successfully!"
      });
    } catch (err) {
      console.error("Error adding comment", err);
      showNotification({
        type: "error",
        message: "Failed to add comment"
      });
    }
  };

  const handleAddReply = async (parentCommentId) => {
    if (!replyText.trim()) return;
    try {
      const mentionedUserIds = users
        .filter((u) => replyText.includes(`@${u.name}`))
        .map((u) => u._id);

      const res = await axios.post(
        "http://localhost:5000/api/comments",
        { 
          text: replyText, 
          mentionedUserIds, 
          parentCommentId 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh comments to get the updated structure
      fetchComments();
      setReplyText("");
      setReplyingTo(null);
      showNotification({
        type: "success",
        message: "Reply added successfully!"
      });
    } catch (err) {
      console.error("Error adding reply", err);
      showNotification({
        type: "error",
        message: "Failed to add reply"
      });
    }
  };

  const handleEditComment = async (comment) => {
    setEditingComment(comment._id);
    setEditText(comment.text);
  };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      const res = await axios.put(
        `http://localhost:5000/api/comments/${id}`,
        { text: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh comments to get the updated structure
      fetchComments();
      setEditingComment(null);
      setEditText("");
      showNotification({
        type: "success",
        message: "Comment updated successfully!"
      });
    } catch (err) {
      console.error("Error editing comment", err);
      showNotification({
        type: "error",
        message: "Failed to edit comment"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText("");
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm("Delete this comment and all its replies?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Refresh comments to get the updated structure
      fetchComments();
    } catch (err) {
      console.error("Error deleting comment", err);
      showNotification({
        type: "error",
        message: "Failed to delete comment"
      });
    }
  };

  // ====================== LOGOUT ======================
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
  // ====================== SALARY MANAGEMENT FUNCTIONS ======================
  const fetchSalaryData = async () => {
    try {
      setSalaryLoading(true);
      setSalaryError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      // Build query parameters for filtering
      const queryParams = new URLSearchParams();
      if (salaryFilters.month) queryParams.append('month', salaryFilters.month);
      if (salaryFilters.year) queryParams.append('year', salaryFilters.year);
      
      const queryString = queryParams.toString();
      const salaryUrl = user.role === "Admin" 
        ? `http://localhost:5000/api/salaries${queryString ? `?${queryString}` : ''}`
        : `http://localhost:5000/api/salaries/my${queryString ? `?${queryString}` : ''}`;
      
      const requests = [
        axios.get(salaryUrl, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ];
      
      // Only fetch staff list if user is Admin
      if (user.role === "Admin") {
        requests.push(
          axios.get("http://localhost:5000/api/auth/users", {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
      }
      
      const responses = await Promise.all(requests);
      const salaryRes = responses[0];
      const staffRes = user.role === "Admin" ? responses[1] : null;
      
      setSalaryRecords(salaryRes.data || []);
      setSalaryStaffList(staffRes?.data || []);
    } catch (err) {
      console.error("Failed to fetch salary data:", err);
      setSalaryError(err.response?.data?.message || err.message);
    } finally {
      setSalaryLoading(false);
    }
  };

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/salaries", salaryFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSalaryFormData({ staffId: "", month: "", year: "", amount: "", remarks: "" });
      fetchSalaryData();
      showNotification({
        type: "success",
        message: "Salary record added successfully!"
      });
    } catch (err) {
      console.error("Error adding salary:", err);
      showNotification({
        type: "error",
        message: "Failed to add salary record. Please try again."
      });
    }
  };

  const handleSalaryDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this salary record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/salaries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSalaryData();
      showNotification({
        type: "success",
        message: "Salary record deleted successfully!"
      });
    } catch (err) {
      console.error("Error deleting salary:", err);
      showNotification({
        type: "error",
        message: "Failed to delete salary record. Please try again."
      });
    }
  };

  const handleSalaryFilterChange = (field, value) => {
    setSalaryFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applySalaryFilters = () => {
    fetchSalaryData();
  };

  const clearSalaryFilters = () => {
    setSalaryFilters({ month: "", year: "" });
    setTimeout(() => fetchSalaryData(), 100);
  };

  // ====================== ATTENDANCE MANAGEMENT FUNCTIONS ======================
  const fetchAttendanceData = async () => {
    try {
      setAttendanceLoading(true);
      setAttendanceError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
    } catch (err) {
      console.error("Failed to fetch attendance data:", err);
      setAttendanceError(err.message);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    try {
   
      const newRecord = {
        _id: Date.now().toString(),
        date: attendanceFormData.date,
        checkIn: attendanceFormData.checkIn,
        checkOut: attendanceFormData.checkOut,
        status: attendanceFormData.status,
        remarks: attendanceFormData.remarks,
        userId: user.id,
        userName: user.name
      };
      
      setAttendanceRecords(prev => [newRecord, ...prev]);
      setAttendanceFormData({ date: "", checkIn: "", checkOut: "", status: "Present", remarks: "" });
      showNotification({
        type: "success",
        message: "Attendance record added successfully!"
      });
    } catch (err) {
      console.error("Error adding attendance:", err);
      showNotification({
        type: "error",
        message: "Failed to add attendance record. Please try again."
      });
    }
  };

  const handleAttendanceFilterChange = (field, value) => {
    setAttendanceFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyAttendanceFilters = () => {
    // Filter logic would go here
    fetchAttendanceData();
  };

  const clearAttendanceFilters = () => {
    setAttendanceFilters({ month: "", year: "", date: "" });
    setTimeout(() => fetchAttendanceData(), 100);
  };

  // ====================== EMPLOYEE PERSONAL INFO FUNCTIONS ======================
  const fetchEmployeeInfo = async () => {
    try {
      setEmployeeLoading(true);
      setEmployeeError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      // Try to get employee info by user ID or email
      const userId = user._id || user.id;
      if (!userId) {
        throw new Error("User ID not found in user object");
      }
      
      const response = await axios.get(`http://localhost:5000/api/employees/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setEmployeeInfo(response.data.data);
        setEmployeeFormData({
          firstName: response.data.data.firstName || "",
          lastName: response.data.data.lastName || "",
          employeeId: response.data.data.employeeId || "",
          email: response.data.data.email || "",
          phone: response.data.data.phone || "",
          dob: response.data.data.dob || "",
          gender: response.data.data.gender || "",
          address: response.data.data.address || "",
          department: response.data.data.department || "",
          role: response.data.data.role || "",
          startDate: response.data.data.startDate || "",
          employmentType: response.data.data.employmentType || "",
          emergencyContact: response.data.data.emergencyContact || "",
          bankAccount: response.data.data.bankAccount || "",
          avatarDataUrl: response.data.data.avatarDataUrl || "",
        });
        setImagePreview(response.data.data.avatarDataUrl || null);
      }
    } catch (err) {
      // If employee not found (404), that's okay - user can create new info
      if (err.response?.status === 404) {
        console.log("No employee info found, user can create new");
        setEmployeeError(null);
      } else {
        console.error("Failed to fetch employee info:", err);
        setEmployeeError(err.response?.data?.message || err.message);
      }
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setEmployeeFormData(prev => ({
          ...prev,
          avatarDataUrl: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmployeeSubmit = async (e) => {
    console.log("inside handleEmployeeSubmit...");
    e.preventDefault();
    try {
      setEmployeeLoading(true);
      setEmployeeError(null);
      const token = localStorage.getItem("token");
      
      const userId = user._id || user.id;
      if (!userId) {
        throw new Error("User ID not found in user object");
      }
      
      const submitData = {
        ...employeeFormData,
        userId: userId,
        userName: user.name
      };
      
      console.log("Submitting employee data:", submitData);
      
      const response = await axios.post("http://localhost:5000/api/employees/save", submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setEmployeeInfo(response.data.data);
        setIsEditMode(false); // Exit edit mode after successful save
        showNotification({
          type: "success",
          message: "Employee information saved successfully!"
        });
        fetchEmployeeInfo(); // Refresh the data
      }
    } catch (err) {
      console.error("Error saving employee info:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to save employee information. Please try again.";
      setEmployeeError(errorMessage);
      showNotification({
        type: "error",
        message: `Error: ${errorMessage}`
      });
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleEmployeeFormChange = (field, value) => {
    setEmployeeFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  // ====================== ADMIN EMPLOYEE MANAGEMENT ======================
  const fetchAllEmployees = async () => {
    try {
      setEmployeeManagementLoading(true);
      const token = localStorage.getItem("token");
      
      // First test if employee routes are working
      try {
        const testResponse = await axios.get("http://localhost:5000/api/employees/test", {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Employee routes test:", testResponse.data);
      } catch (testErr) {
        console.log("Employee routes test failed:", testErr.message);
      }
      
      // Try the admin/all endpoint first
      try {
        const response = await axios.get("http://localhost:5000/api/employees/admin/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setAllEmployees(response.data.data);
          return;
        }
      } catch (adminErr) {
        console.log("Admin/all endpoint failed, trying fallback...", adminErr.message);
      }
      
      // Fallback to regular employees endpoint
      const response = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAllEmployees(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching all employees:", err);
      showNotification({
        type: "error",
        message: "Error fetching employees: " + (err.response?.data?.message || err.message)
      });
    } finally {
      setEmployeeManagementLoading(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeFormData({
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      employeeId: employee.employeeId || "",
      email: employee.email || "",
      phone: employee.phone || "",
      dob: employee.dob || "",
      gender: employee.gender || "",
      address: employee.address || "",
      department: employee.department || "",
      role: employee.role || "",
      startDate: employee.startDate || "",
      employmentType: employee.employmentType || "",
      emergencyContact: employee.emergencyContact || "",
      bankAccount: employee.bankAccount || "",
      avatarDataUrl: employee.avatarDataUrl || "",
    });
    setEmployeeEditMode(true);
    setShowEmployeeModal(true);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      setEmployeeManagementLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.put(
        `http://localhost:5000/api/employees/${selectedEmployee._id}`,
        employeeFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showNotification({
          type: "success",
          message: "Employee updated successfully!"
        });
        setShowEmployeeModal(false);
        setEmployeeEditMode(false);
        setSelectedEmployee(null);
        fetchAllEmployees(); // Refresh the list
      }
    } catch (err) {
      console.error("Error updating employee:", err);
      showNotification({
        type: "error",
        message: "Error updating employee: " + (err.response?.data?.message || err.message)
      });
    } finally {
      setEmployeeManagementLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      return;
    }
    
    try {
      setEmployeeManagementLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.delete(
        `http://localhost:5000/api/employees/${employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showNotification({
          type: "success",
          message: "Employee deleted successfully!"
        });
        fetchAllEmployees(); // Refresh the list
      }
    } catch (err) {
      console.error("Error deleting employee:", err);
      showNotification({
        type: "error",
        message: "Error deleting employee: " + (err.response?.data?.message || err.message)
      });
    } finally {
      setEmployeeManagementLoading(false);
    }
  };

  // ====================== UI START ======================
  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", background: "#f8f9fa" }}
    >
      {/* ===== Sidebar ===== */}
      <div
        className="bg-primary text-white p-3 d-flex flex-column"
        style={{ width: "250px" }}
      >
        <h4 className="text-center mb-4">BugStrack</h4>
        <Button
          variant={activeSection === "workitems" ? "light" : "outline-light"}
          className="mb-2 text-start"
          onClick={() => setActiveSection("workitems")}
        >
          🐞 Work Items
        </Button>

        {user.role === "Admin" && (
          <Button
            variant={activeSection === "users" ? "light" : "outline-light"}
            className="mb-2 text-start"
            onClick={() => setActiveSection("users")}
          >
            👥 Role settings
          </Button>
        )}

        {user.role === "Admin" && (
          <Button
            variant={activeSection === "employee-management" ? "light" : "outline-light"}
            className="mb-2 text-start"
            onClick={() => {
              setActiveSection("employee-management");
              fetchAllEmployees();
            }}
          >
            👤 Employee Management
          </Button>
        )}

        <Button
          variant={activeSection === "comments" ? "light" : "outline-light"}
          className="mb-2 text-start"
          onClick={() => {
            setActiveSection("comments");
            fetchComments();
          }}
        >
          💬 Comments
        </Button>
        <Button
          variant={activeSection === "payments" ? "light" : "outline-light"}
          className="mb-2 text-start"
          onClick={() => {
            setActiveSection("payments");
            fetchSalaryData();
          }}
        >
          💰 Payments
        </Button>
         <Button
           variant={activeSection === "attendance" ? "light" : "outline-light"}
           className="mb-2 text-start"
           onClick={() => {
             setActiveSection("attendance");
             fetchAttendanceData();
           }}
         >
           ⏱ Attendance
         </Button>
         <Button
           variant={activeSection === "employee-info" ? "light" : "outline-light"}
           className="mb-2 text-start"
           onClick={() => {
             setActiveSection("employee-info");
             fetchEmployeeInfo();
           }}
         >
           👤 Personal Info
         </Button>

        <div className="mt-auto">
          <Button variant="danger" className="w-100" onClick={handleLogout}>
            🚪 Logout
          </Button>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">
            Welcome, {user.name} ({user.role})
          </h3>
          {/* User Avatar in top right */}
          <div className="d-flex align-items-center">
            {employeeInfo?.avatarDataUrl ? (
              <img
                src={employeeInfo.avatarDataUrl}
                alt="Profile"
                className="rounded-circle"
                style={{ width: "50px", height: "50px", objectFit: "cover" }}
              />
            ) : (
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                style={{ width: "50px", height: "50px", fontSize: "20px" }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* ---------- WORK ITEMS SECTION ---------- */}
        {activeSection === "workitems" && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Work Items</h4>
              {user.role === "Admin" && (
                <Button variant="success" onClick={handleCreate}>
                  ➕ Create Work Item
                </Button>
              )}
            </div>

            <div className="table-responsive shadow-sm rounded">
              <Table hover bordered className="align-middle text-center">
                <thead className="table-primary">
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Created By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workItems.length > 0 ? (
                    workItems.map((wi) => (
                      <tr key={wi._id}>
                        <td>{wi.title}</td>
                        <td>{wi.description}</td>
                        <td>
                          <span
                            className={`badge ${
                              wi.status === "Completed"
                                ? "bg-success"
                                : wi.status === "In Progress"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {wi.status}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              wi.priority === "High"
                                ? "bg-danger"
                                : wi.priority === "Medium"
                                ? "bg-warning text-dark"
                                : "bg-info text-dark"
                            }`}
                          >
                            {wi.priority}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              {wi.assignedTo?.avatarDataUrl ? (
                                <img
                                  src={wi.assignedTo.avatarDataUrl}
                                  alt={wi.assignedTo?.name}
                                  className="rounded-circle"
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center fw-bold"
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    fontSize: "11px",
                                  }}
                                >
                                  {wi.assignedTo?.name?.charAt(0).toUpperCase() || "?"}
                                </div>
                              )}
                            </div>
                            <span>{wi.assignedTo?.name || "N/A"}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              {wi.createdBy?.avatarDataUrl ? (
                                <img
                                  src={wi.createdBy.avatarDataUrl}
                                  alt={wi.createdBy?.name}
                                  className="rounded-circle"
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold"
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    fontSize: "11px",
                                  }}
                                >
                                  {wi.createdBy?.name?.charAt(0).toUpperCase() || "?"}
                                </div>
                              )}
                            </div>
                            <span>{wi.createdBy?.name || "N/A"}</span>
                          </div>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEdit(wi)}
                          >
                            ✏️ Edit
                          </Button>{" "}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(wi._id)}
                          >
                            🗑️ Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-muted">
                        No work items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {/* ---------- USER MANAGEMENT SECTION ---------- */}
        {activeSection === "users" && user.role === "Admin" && (
          <div>
            <h4>Role Settings</h4>
            <Table bordered hover className="mt-3 text-center align-middle">
              <thead className="table-info">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="me-2">
                          {u.avatarDataUrl ? (
                            <img
                              src={u.avatarDataUrl}
                              alt={u.name}
                              className="rounded-circle"
                              style={{
                                width: "32px",
                                height: "32px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                              style={{
                                width: "32px",
                                height: "32px",
                                fontSize: "12px",
                              }}
                            >
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === "Admin" ? "bg-danger" : "bg-secondary"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleRoleEdit(u)}
                      >
                        ✏️ Edit Role
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* ---------- EMPLOYEE MANAGEMENT SECTION ---------- */}
        {activeSection === "employee-management" && user.role === "Admin" && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>👤 Employee Management</h4>
              <Button 
                variant="primary" 
                onClick={fetchAllEmployees}
                disabled={employeeManagementLoading}
              >
                {employeeManagementLoading ? "🔄 Loading..." : "🔄 Refresh"}
              </Button>
            </div>

            {employeeManagementLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading employees...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table bordered hover className="text-center align-middle">
                  <thead className="table-primary">
                    <tr>
                      <th>Avatar</th>
                      <th>Name</th>
                      <th>Employee ID</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>User Account</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allEmployees.length > 0 ? (
                      allEmployees.map((employee) => (
                        <tr key={employee._id}>
                          <td>
                            {employee.avatarDataUrl ? (
                              <img
                                src={employee.avatarDataUrl}
                                alt={`${employee.firstName} ${employee.lastName}`}
                                className="rounded-circle"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div
                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  fontSize: "16px",
                                }}
                              >
                                {employee.firstName?.charAt(0).toUpperCase() || "?"}
                              </div>
                            )}
                          </td>
                          <td>
                            <strong>{employee.firstName} {employee.lastName}</strong>
                          </td>
                          <td>
                            <span className="badge bg-info">{employee.employeeId}</span>
                          </td>
                          <td>{employee.email || "Not provided"}</td>
                          <td>{employee.department || "Not provided"}</td>
                          <td>
                            <span className="badge bg-secondary">{employee.role || "Not provided"}</span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-2">
                                {employee.userId?.avatarDataUrl ? (
                                  <img
                                    src={employee.userId.avatarDataUrl}
                                    alt={employee.userId?.name}
                                    className="rounded-circle"
                                    style={{
                                      width: "24px",
                                      height: "24px",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <div
                                    className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold"
                                    style={{
                                      width: "24px",
                                      height: "24px",
                                      fontSize: "10px",
                                    }}
                                  >
                                    {employee.userId?.name?.charAt(0).toUpperCase() || "?"}
                                  </div>
                                )}
                              </div>
                              <div>
                                <small className="fw-bold">{employee.userId?.name || employee.userName || "Unknown"}</small>
                                <br />
                                <small className="text-muted">{employee.userId?.role || "Unknown"}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleEditEmployee(employee)}
                                title="Edit Employee"
                              >
                                ✏️
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteEmployee(employee._id)}
                                title="Delete Employee"
                              >
                                🗑️
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-muted py-4">
                          No employees found. Employees will appear here once they fill out their personal information.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* ---------- PAYMENTS SECTION ---------- */}
        {activeSection === "payments" && (
          <div>
            <h4 className="mb-3">
              💰{" "}
              {user.role === "Admin"
                ? "Salary Management"
                : "My Salary Records"}
            </h4>

            {salaryError && (
              <Alert variant="danger" className="mb-4">
                <strong>Error:</strong> {salaryError}
                <div className="mt-2">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={fetchSalaryData}
                  >
                    🔄 Retry
                  </Button>
                </div>
              </Alert>
            )}

            {salaryLoading && (
              <div className="text-center mb-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading salary data...</p>
              </div>
            )}

            {/* Filter Section */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">🔍 Filter Records</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <Form.Label>Month</Form.Label>
                    <Form.Select
                      value={salaryFilters.month}
                      onChange={(e) =>
                        handleSalaryFilterChange("month", e.target.value)
                      }
                    >
                      <option value="">All Months</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString("default", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <Form.Label>Year</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter year (e.g., 2025)"
                      value={salaryFilters.year}
                      onChange={(e) =>
                        handleSalaryFilterChange("year", e.target.value)
                      }
                      min="2020"
                      max="2030"
                    />
                  </div>
                  <div className="col-md-4 mb-3 d-flex align-items-end">
                    <div className="d-flex gap-2">
                      <Button variant="primary" onClick={applySalaryFilters}>
                        🔍 Apply Filters
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={clearSalaryFilters}
                      >
                        🗑️ Clear
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Salary Form (Admin Only) */}
            {user.role === "Admin" && (
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Add New Salary Record</h5>
                </div>
                <div className="card-body">
                  <Form onSubmit={handleSalarySubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <Form.Label>Staff Member</Form.Label>
                        <Form.Select
                          value={salaryFormData.staffId}
                          onChange={(e) =>
                            setSalaryFormData({
                              ...salaryFormData,
                              staffId: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select Staff</option>
                          {salaryStaffList.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name} ({s.role})
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                      <div className="col-md-3 mb-3">
                        <Form.Label>Month</Form.Label>
                        <Form.Select
                          value={salaryFormData.month}
                          onChange={(e) =>
                            setSalaryFormData({
                              ...salaryFormData,
                              month: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select Month</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {new Date(0, i).toLocaleString("default", {
                                month: "long",
                              })}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                      <div className="col-md-3 mb-3">
                        <Form.Label>Year</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="2025"
                          value={salaryFormData.year}
                          onChange={(e) =>
                            setSalaryFormData({
                              ...salaryFormData,
                              year: e.target.value,
                            })
                          }
                          required
                          min="2020"
                          max="2030"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <Form.Label>Amount (₹)</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter amount"
                          value={salaryFormData.amount}
                          onChange={(e) =>
                            setSalaryFormData({
                              ...salaryFormData,
                              amount: e.target.value,
                            })
                          }
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <Form.Label>Remarks (Optional)</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter remarks"
                          value={salaryFormData.remarks}
                          onChange={(e) =>
                            setSalaryFormData({
                              ...salaryFormData,
                              remarks: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <Button type="submit" variant="primary">
                      💰 Add Salary Record
                    </Button>
                  </Form>
                </div>
              </div>
            )}

            {/* Salary Records Table */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  {user.role === "Admin"
                    ? "Salary Records"
                    : "My Salary Records"}
                </h5>
              </div>
              <div className="card-body p-0">
                {salaryRecords.length > 0 ? (
                  <Table responsive hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        {user.role === "Admin" && <th>Staff Member</th>}
                        <th>Month</th>
                        <th>Year</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Remarks</th>
                        {user.role === "Admin" && <th>Created By</th>}
                        {user.role === "Admin" && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {salaryRecords.map((r) => (
                        <tr key={r._id}>
                          {user.role === "Admin" && (
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  {r.staffId?.avatarDataUrl ? (
                                    <img
                                      src={r.staffId.avatarDataUrl}
                                      alt={r.staffId?.name}
                                      className="rounded-circle"
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {r.staffId?.name?.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <strong>{r.staffId?.name}</strong>
                                  <br />
                                  <small className="text-muted">
                                    {r.staffId?.role}
                                  </small>
                                </div>
                              </div>
                            </td>
                          )}
                          <td>
                            <span className="badge bg-info">
                              {new Date(0, r.month - 1).toLocaleString(
                                "default",
                                { month: "long" }
                              )}
                            </span>
                          </td>
                          <td>{r.year}</td>
                          <td>
                            <strong className="text-success">
                              ₹{r.amount.toLocaleString()}
                            </strong>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                r.status === "Paid"
                                  ? "bg-success"
                                  : r.status === "Pending"
                                  ? "bg-warning text-dark"
                                  : "bg-danger"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td>{r.remarks || "-"}</td>
                          {user.role === "Admin" && (
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  {r.createdBy?.avatarDataUrl ? (
                                    <img
                                      src={r.createdBy.avatarDataUrl}
                                      alt={r.createdBy?.name}
                                      className="rounded-circle"
                                      style={{
                                        width: "24px",
                                        height: "24px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
                                      style={{
                                        width: "24px",
                                        height: "24px",
                                        fontSize: "10px",
                                      }}
                                    >
                                      {r.createdBy?.name?.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <small>{r.createdBy?.name}</small>
                              </div>
                            </td>
                          )}
                          {user.role === "Admin" && (
                            <td>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleSalaryDelete(r._id)}
                              >
                                🗑️ Delete
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-muted mb-0">No salary records found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
         )}

         {/* ---------- ATTENDANCE SECTION ---------- */}
         {activeSection === "attendance" && (
           <div>
             <h4 className="mb-3">⏱ My Attendance Records</h4>

             {attendanceError && (
               <Alert variant="danger" className="mb-4">
                 <strong>Error:</strong> {attendanceError}
                 <div className="mt-2">
                   <Button
                     variant="outline-danger"
                     size="sm"
                     onClick={fetchAttendanceData}
                   >
                     🔄 Retry
                   </Button>
                 </div>
               </Alert>
             )}

             {attendanceLoading && (
               <div className="text-center mb-4">
                 <div className="spinner-border text-primary" role="status">
                   <span className="visually-hidden">Loading...</span>
                 </div>
                 <p className="mt-2">Loading attendance data...</p>
               </div>
             )}

             {/* Filter Section */}
             <div className="card mb-4">
               <div className="card-header">
                 <h5 className="mb-0">🔍 Filter Records</h5>
               </div>
               <div className="card-body">
                 <div className="row">
                   <div className="col-md-3 mb-3">
                     <Form.Label>Month</Form.Label>
                     <Form.Select
                       value={attendanceFilters.month}
                       onChange={(e) =>
                         handleAttendanceFilterChange("month", e.target.value)
                       }
                     >
                       <option value="">All Months</option>
                       {Array.from({ length: 12 }, (_, i) => (
                         <option key={i + 1} value={i + 1}>
                           {new Date(0, i).toLocaleString("default", {
                             month: "long",
                           })}
                         </option>
                       ))}
                     </Form.Select>
                   </div>
                   <div className="col-md-3 mb-3">
                     <Form.Label>Year</Form.Label>
                     <Form.Control
                       type="number"
                       placeholder="Enter year (e.g., 2025)"
                       value={attendanceFilters.year}
                       onChange={(e) =>
                         handleAttendanceFilterChange("year", e.target.value)
                       }
                       min="2020"
                       max="2030"
                     />
                   </div>
                   <div className="col-md-3 mb-3">
                     <Form.Label>Date</Form.Label>
                     <Form.Control
                       type="date"
                       value={attendanceFilters.date}
                       onChange={(e) =>
                         handleAttendanceFilterChange("date", e.target.value)
                       }
                     />
                   </div>
                   <div className="col-md-3 mb-3 d-flex align-items-end">
                     <div className="d-flex gap-2">
                       <Button variant="primary" onClick={applyAttendanceFilters}>
                         🔍 Apply Filters
                       </Button>
                       <Button
                         variant="outline-secondary"
                         onClick={clearAttendanceFilters}
                       >
                         🗑️ Clear
                       </Button>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             {/* Add Attendance Form */}
             <div className="card mb-4">
               <div className="card-header">
                 <h5 className="mb-0">Add New Attendance Record</h5>
               </div>
               <div className="card-body">
                 <Form onSubmit={handleAttendanceSubmit}>
                   <div className="row">
                     <div className="col-md-3 mb-3">
                       <Form.Label>Date</Form.Label>
                       <Form.Control
                         type="date"
                         value={attendanceFormData.date}
                         onChange={(e) =>
                           setAttendanceFormData({
                             ...attendanceFormData,
                             date: e.target.value,
                           })
                         }
                         required
                       />
                     </div>
                     <div className="col-md-3 mb-3">
                       <Form.Label>Check In Time</Form.Label>
                       <Form.Control
                         type="time"
                         value={attendanceFormData.checkIn}
                         onChange={(e) =>
                           setAttendanceFormData({
                             ...attendanceFormData,
                             checkIn: e.target.value,
                           })
                         }
                       />
                     </div>
                     <div className="col-md-3 mb-3">
                       <Form.Label>Check Out Time</Form.Label>
                       <Form.Control
                         type="time"
                         value={attendanceFormData.checkOut}
                         onChange={(e) =>
                           setAttendanceFormData({
                             ...attendanceFormData,
                             checkOut: e.target.value,
                           })
                         }
                       />
                     </div>
                     <div className="col-md-3 mb-3">
                       <Form.Label>Status</Form.Label>
                       <Form.Select
                         value={attendanceFormData.status}
                         onChange={(e) =>
                           setAttendanceFormData({
                             ...attendanceFormData,
                             status: e.target.value,
                           })
                         }
                         required
                       >
                         <option value="Present">Present</option>
                         <option value="Absent">Absent</option>
                         <option value="Late">Late</option>
                         <option value="Half Day">Half Day</option>
                       </Form.Select>
                     </div>
                   </div>
                   <div className="row">
                     <div className="col-md-12 mb-3">
                       <Form.Label>Remarks (Optional)</Form.Label>
                       <Form.Control
                         type="text"
                         placeholder="Enter remarks"
                         value={attendanceFormData.remarks}
                         onChange={(e) =>
                           setAttendanceFormData({
                             ...attendanceFormData,
                             remarks: e.target.value,
                           })
                         }
                       />
                     </div>
                   </div>
                   <Button type="submit" variant="primary">
                     ⏱ Add Attendance Record
                   </Button>
                 </Form>
               </div>
             </div>

             {/* Attendance Records Table */}
             <div className="card">
               <div className="card-header">
                 <h5 className="mb-0">My Attendance Records</h5>
               </div>
               <div className="card-body p-0">
                 {attendanceRecords.length > 0 ? (
                   <Table responsive hover className="mb-0">
                     <thead className="table-light">
                       <tr>
                         <th>Date</th>
                         <th>Check In</th>
                         <th>Check Out</th>
                         <th>Status</th>
                         <th>Hours Worked</th>
                         <th>Remarks</th>
                       </tr>
                     </thead>
                     <tbody>
                       {attendanceRecords.map((r) => (
                         <tr key={r._id}>
                           <td>
                             <strong>
                               {new Date(r.date).toLocaleDateString("en-US", {
                                 weekday: "short",
                                 year: "numeric",
                                 month: "short",
                                 day: "numeric",
                               })}
                             </strong>
                           </td>
                           <td>
                             {r.checkIn ? (
                               <span className="text-success">{r.checkIn}</span>
                             ) : (
                               <span className="text-muted">-</span>
                             )}
                           </td>
                           <td>
                             {r.checkOut ? (
                               <span className="text-success">{r.checkOut}</span>
                             ) : (
                               <span className="text-muted">-</span>
                             )}
                           </td>
                           <td>
                             <span
                               className={`badge ${
                                 r.status === "Present"
                                   ? "bg-success"
                                   : r.status === "Absent"
                                   ? "bg-danger"
                                   : r.status === "Late"
                                   ? "bg-warning text-dark"
                                   : "bg-info"
                               }`}
                             >
                               {r.status}
                             </span>
                           </td>
                           <td>
                             {r.checkIn && r.checkOut ? (
                               <span className="text-primary">
                                 {(() => {
                                   const checkIn = new Date(`2000-01-01T${r.checkIn}`);
                                   const checkOut = new Date(`2000-01-01T${r.checkOut}`);
                                   const diff = checkOut - checkIn;
                                   const hours = Math.floor(diff / (1000 * 60 * 60));
                                   const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                   return `${hours}h ${minutes}m`;
                                 })()}
                               </span>
                             ) : (
                               <span className="text-muted">-</span>
                             )}
                           </td>
                           <td>{r.remarks || "-"}</td>
                         </tr>
                       ))}
                     </tbody>
                   </Table>
                 ) : (
                   <div className="p-4 text-center">
                     <p className="text-muted mb-0">No attendance records found.</p>
                   </div>
                 )}
               </div>
             </div>
           </div>
         )}

         {/* ---------- EMPLOYEE PERSONAL INFO SECTION ---------- */}
         {activeSection === "employee-info" && (
           <div 
             className="d-flex flex-column"
             style={{ height: "calc(100vh - 100px)", overflowY: "auto" }}
           >
             <div className="d-flex justify-content-between align-items-center mb-3">
               <h4 className="mb-0">👤 Personal Information</h4>
               {employeeInfo && !isEditMode && (
                 <Button variant="outline-primary" onClick={handleEditClick}>
                   ✏️ Edit Information
                 </Button>
               )}
             </div>

             {employeeError && (
               <Alert variant="danger" className="mb-4">
                 <strong>Error:</strong> {employeeError}
                 <div className="mt-2">
                   <Button
                     variant="outline-danger"
                     size="sm"
                     onClick={fetchEmployeeInfo}
                   >
                     🔄 Retry
                   </Button>
                 </div>
               </Alert>
             )}

             {employeeLoading && (
               <div className="text-center mb-4">
                 <div className="spinner-border text-primary" role="status">
                   <span className="visually-hidden">Loading...</span>
                 </div>
                 <p className="mt-2">Loading employee information...</p>
               </div>
             )}

             {/* Employee Information Form - Show only in edit mode or when no data exists */}
             {(isEditMode || !employeeInfo) && (
               <div className="card mb-4">
                 <div className="card-header d-flex justify-content-between align-items-center">
                   <h5 className="mb-0">Personal Information Form</h5>
                   {isEditMode && (
                     <Button variant="outline-secondary" onClick={toggleEditMode}>
                       ❌ Cancel
                     </Button>
                   )}
                 </div>
                 <div className="card-body">
                   <Form onSubmit={handleEmployeeSubmit}>
                   {/* Profile Image Upload */}
                   <div className="row mb-4">
                     <div className="col-md-12">
                       <Form.Label>Profile Picture</Form.Label>
                       <div className="d-flex align-items-center">
                         {imagePreview && (
                           <div className="me-3">
                             <img
                               src={imagePreview}
                               alt="Profile Preview"
                               style={{
                                 width: "80px",
                                 height: "80px",
                                 objectFit: "cover",
                                 borderRadius: "50%",
                                 border: "2px solid #dee2e6"
                               }}
                             />
                           </div>
                         )}
                         <Form.Control
                           type="file"
                           accept="image/*"
                           onChange={handleImageUpload}
                           style={{ maxWidth: "300px" }}
                         />
                       </div>
                     </div>
                   </div>

                   {/* Basic Information */}
                   <div className="row">
                     <div className="col-md-6 mb-3">
                       <Form.Label>First Name *</Form.Label>
                       <Form.Control
                         type="text"
                         placeholder="Enter first name"
                         value={employeeFormData.firstName}
                         onChange={(e) => handleEmployeeFormChange("firstName", e.target.value)}
                         required
                       />
                     </div>
                     <div className="col-md-6 mb-3">
                       <Form.Label>Last Name *</Form.Label>
                       <Form.Control
                         type="text"
                         placeholder="Enter last name"
                         value={employeeFormData.lastName}
                         onChange={(e) => handleEmployeeFormChange("lastName", e.target.value)}
                         required
                       />
                     </div>
                   </div>

                   <div className="row">
                     <div className="col-md-6 mb-3">
                       <Form.Label>Employee ID *</Form.Label>
                       <Form.Control
                         type="text"
                         placeholder="Enter employee ID"
                         value={employeeFormData.employeeId}
                         onChange={(e) => handleEmployeeFormChange("employeeId", e.target.value)}
                         required
                       />
                     </div>
                     <div className="col-md-6 mb-3">
                       <Form.Label>Email *</Form.Label>
                       <Form.Control
                         type="email"
                         placeholder="Enter email"
                         value={employeeFormData.email}
                         onChange={(e) => handleEmployeeFormChange("email", e.target.value)}
                         required
                       />
                     </div>
                   </div>

                   <div className="row">
                     <div className="col-md-6 mb-3">
                       <Form.Label>Phone Number</Form.Label>
                       <Form.Control
                         type="tel"
                         placeholder="Enter phone number"
                         value={employeeFormData.phone}
                         onChange={(e) => handleEmployeeFormChange("phone", e.target.value)}
                       />
                     </div>
                     <div className="col-md-6 mb-3">
                       <Form.Label>Date of Birth</Form.Label>
                       <Form.Control
                         type="date"
                         value={employeeFormData.dob}
                         onChange={(e) => handleEmployeeFormChange("dob", e.target.value)}
                       />
                     </div>
                   </div>

                   <div className="row">
                     <div className="col-md-6 mb-3">
                       <Form.Label>Gender</Form.Label>
                       <Form.Select
                         value={employeeFormData.gender}
                         onChange={(e) => handleEmployeeFormChange("gender", e.target.value)}
                       >
                         <option value="">Select Gender</option>
                         <option value="Male">Male</option>
                         <option value="Female">Female</option>
                         <option value="Other">Other</option>
                       </Form.Select>
                     </div>
                     <div className="col-md-6 mb-3">
                       <Form.Label>Employment Type</Form.Label>
                       <Form.Select
                         value={employeeFormData.employmentType}
                         onChange={(e) => handleEmployeeFormChange("employmentType", e.target.value)}
                       >
                         <option value="">Select Type</option>
                         <option value="Full-time">Full-time</option>
                         <option value="Part-time">Part-time</option>
                         <option value="Contract">Contract</option>
                         <option value="Intern">Intern</option>
                       </Form.Select>
                     </div>
                   </div>

                   {/* Address */}
                   <div className="row">
                     <div className="col-md-12 mb-3">
                       <Form.Label>Address</Form.Label>
                       <Form.Control
                         as="textarea"
                         rows={3}
                         placeholder="Enter full address"
                         value={employeeFormData.address}
                         onChange={(e) => handleEmployeeFormChange("address", e.target.value)}
                       />
                     </div>
                   </div>

                   {/* Work Information */}
                   <div className="row">
                     <div className="col-md-6 mb-3">
                       <Form.Label>Department</Form.Label>
                       <Form.Control
                         type="text"
                         placeholder="Enter department"
                         value={employeeFormData.department}
                         onChange={(e) => handleEmployeeFormChange("department", e.target.value)}
                       />
                     </div>
                     <div className="col-md-6 mb-3">
                       <Form.Label>Role</Form.Label>
                       <Form.Control
                         type="text"
                         placeholder="Enter role"
                         value={employeeFormData.role}
                         onChange={(e) => handleEmployeeFormChange("role", e.target.value)}
                       />
                     </div>
                   </div>

                   <div className="row">
                     <div className="col-md-6 mb-3">
                       <Form.Label>Start Date</Form.Label>
                       <Form.Control
                         type="date"
                         value={employeeFormData.startDate}
                         onChange={(e) => handleEmployeeFormChange("startDate", e.target.value)}
                       />
                     </div>
                     <div className="col-md-6 mb-3">
                       <Form.Label>Emergency Contact</Form.Label>
                       <Form.Control
                         type="tel"
                         placeholder="Enter emergency contact"
                         value={employeeFormData.emergencyContact}
                         onChange={(e) => handleEmployeeFormChange("emergencyContact", e.target.value)}
                       />
                     </div>
                   </div>

                   {/* Bank Information */}
                   <div className="row">
                     <div className="col-md-12 mb-3">
                       <Form.Label>Bank Account Number</Form.Label>
                       <Form.Control
                         type="text"
                         placeholder="Enter bank account number"
                         value={employeeFormData.bankAccount}
                         onChange={(e) => handleEmployeeFormChange("bankAccount", e.target.value)}
                       />
                     </div>
                   </div>

                     <Button type="submit" variant="primary" disabled={employeeLoading}>
                       {employeeLoading ? (
                         <>
                           <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                           Saving...
                         </>
                       ) : (
                         "💾 Save Information"
                       )}
                     </Button>
                   </Form>
                 </div>
               </div>
             )}

             {/* Display Current Information - Show only when not in edit mode */}
             {employeeInfo && !isEditMode && (
               <div className="card">
                 <div className="card-header">
                   <h5 className="mb-0">Current Information</h5>
                 </div>
                 <div className="card-body">
                   <div className="row">
                     <div className="col-md-6">
                       <p><strong>Name:</strong> {employeeInfo.firstName} {employeeInfo.lastName}</p>
                       <p><strong>Employee ID:</strong> {employeeInfo.employeeId}</p>
                       <p><strong>Email:</strong> {employeeInfo.email}</p>
                       <p><strong>Phone:</strong> {employeeInfo.phone || "Not provided"}</p>
                       <p><strong>Department:</strong> {employeeInfo.department || "Not provided"}</p>
                     </div>
                     <div className="col-md-6">
                       <p><strong>Role:</strong> {employeeInfo.role || "Not provided"}</p>
                       <p><strong>Start Date:</strong> {employeeInfo.startDate || "Not provided"}</p>
                       <p><strong>Employment Type:</strong> {employeeInfo.employmentType || "Not provided"}</p>
                       <p><strong>Emergency Contact:</strong> {employeeInfo.emergencyContact || "Not provided"}</p>
                     </div>
                     
                   </div>
                 </div>
               </div>
             )}

             {/* Show message when no data exists and not in edit mode */}
             {!employeeInfo && !isEditMode && (
               <div className="card">
                 <div className="card-body text-center">
                   <p className="text-muted mb-0">No personal information saved yet. Please fill out the form above to get started.</p>
                 </div>
               </div>
             )}
           </div>
         )}

         {/* ---------- COMMENTS SECTION ---------- */}
        {activeSection === "comments" && (
          <div
            className="d-flex flex-column"
            style={{ height: "calc(100vh - 100px)" }}
          >
            <h4 className="mb-3">💬 Team Comments</h4>

            <div className="mb-3">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Type a comment and mention users with @name..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button
                variant="primary"
                className="mt-2"
                onClick={handleAddComment}
              >
                ➕ Add Comment
              </Button>
            </div>

            {comments.length > 0 ? (
              <div
                className="flex-grow-1 overflow-auto p-3 border rounded"
                style={{
                  maxHeight: "calc(100vh - 300px)",
                  backgroundColor: "#f8f9fa",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#6c757d #f8f9fa",
                }}
              >
                {comments.map((c) => (
                  <div key={c._id} className="mb-4 pb-3 border-bottom">
                    {/* Main Comment */}
                    <div className="d-flex align-items-start mb-2">
                      <div className="me-2">
                        {c.createdBy?.avatarDataUrl ? (
                          <img
                            src={c.createdBy.avatarDataUrl}
                            alt={c.createdBy?.name}
                            className="rounded-circle"
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                            style={{
                              width: "40px",
                              height: "40px",
                              fontSize: "16px",
                            }}
                          >
                            {c.createdBy?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-1">
                          <strong className="me-2">{c.createdBy?.name}</strong>
                          <small className="text-muted">
                            {new Date(c.createdAt).toLocaleString("en-US", {
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </small>
                        </div>

                        {editingComment === c._id ? (
                          <div className="mb-2">
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="mb-2"
                              style={{ fontSize: "14px" }}
                              autoFocus
                            />
                            <div className="d-flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSaveEdit(c._id)}
                              >
                                ✓ Save
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-2">{c.text}</div>
                        )}

                        {c.mentionedUsers?.length > 0 && (
                          <small className="text-info d-block mb-2">
                            Mentions:{" "}
                            {c.mentionedUsers
                              .map((u) => `@${u.name}`)
                              .join(", ")}
                          </small>
                        )}

                        {editingComment !== c._id && (
                          <div className="mt-1">
                            <Button
                              variant="link"
                              size="sm"
                              className="text-primary p-0 me-3 text-decoration-none"
                              onClick={() => setReplyingTo(c._id)}
                              style={{ fontSize: "13px" }}
                            >
                              💬 Reply
                            </Button>
                            {(c.createdBy?._id === user.id ||
                              user.role === "Admin") && (
                              <>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-muted p-0 me-3 text-decoration-none"
                                  onClick={() => handleEditComment(c)}
                                  style={{ fontSize: "13px" }}
                                >
                                  ✏️ Edit
                                </Button>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-danger p-0 text-decoration-none"
                                  onClick={() => handleDeleteComment(c._id)}
                                  style={{ fontSize: "13px" }}
                                >
                                  🗑️ Delete
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reply Input */}
                    {replyingTo === c._id && (
                      <div className="mt-3 ms-5">
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder={`Reply to ${c.createdBy?.name}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="mb-2"
                          style={{ fontSize: "14px" }}
                        />
                        <div className="d-flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAddReply(c._id)}
                          >
                            Send
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="ms-5 mt-3">
                        {c.replies.map((reply, index) => (
                          <div key={reply._id} className="mb-3">
                            <div className="d-flex align-items-start">
                              <div className="me-2">
                                {reply.createdBy?.avatarDataUrl ? (
                                  <img
                                    src={reply.createdBy.avatarDataUrl}
                                    alt={reply.createdBy?.name}
                                    className="rounded-circle"
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <div
                                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {reply.createdBy?.name
                                      ?.charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center mb-1">
                                  <strong className="me-2">
                                    {reply.createdBy?.name}
                                  </strong>
                                  <small className="text-muted">
                                    {new Date(reply.createdAt).toLocaleString(
                                      "en-US",
                                      {
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      }
                                    )}
                                  </small>
                                </div>

                                {/* Replied to indicator - Teams style with dark theme */}
                                <div
                                  className="border-start border-2 ps-2 py-1 mb-2"
                                  style={{
                                    backgroundColor: "#3a3a3a",
                                    borderColor: "#616161 !important",
                                    borderRadius: "4px",
                                    paddingLeft: "12px",
                                    marginLeft: "0px",
                                  }}
                                >
                                  <div style={{ fontSize: "13px" }}>
                                    <div
                                      className="text-white mb-1"
                                      style={{ fontSize: "13px" }}
                                    >
                                      <strong>{c.createdBy?.name}</strong>{" "}
                                      <span
                                        className="text-muted"
                                        style={{ fontSize: "12px" }}
                                      >
                                        {new Date(c.createdAt).toLocaleString(
                                          "en-US",
                                          {
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                          }
                                        )}
                                      </span>
                                    </div>
                                    <div
                                      className="text-white"
                                      style={{
                                        fontSize: "13px",
                                        opacity: "0.9",
                                      }}
                                    >
                                      {c.text.length > 100
                                        ? `${c.text.substring(0, 100)}...`
                                        : c.text}
                                    </div>
                                  </div>
                                </div>

                                {editingComment === reply._id ? (
                                  <div className="mb-2">
                                    <Form.Control
                                      as="textarea"
                                      rows={3}
                                      value={editText}
                                      onChange={(e) =>
                                        setEditText(e.target.value)
                                      }
                                      className="mb-2"
                                      style={{ fontSize: "14px" }}
                                      autoFocus
                                    />
                                    <div className="d-flex gap-2">
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() =>
                                          handleSaveEdit(reply._id)
                                        }
                                      >
                                        ✓ Save
                                      </Button>
                                      <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={handleCancelEdit}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mb-2">{reply.text}</div>
                                )}

                                {reply.mentionedUsers?.length > 0 && (
                                  <small className="text-info d-block mb-2">
                                    Mentions:{" "}
                                    {reply.mentionedUsers
                                      .map((u) => `@${u.name}`)
                                      .join(", ")}
                                  </small>
                                )}

                                {editingComment !== reply._id &&
                                  (c.createdBy?._id === user.id ||
                                    user.role === "Admin") && (
                                    <div className="mt-1">
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="text-muted p-0 me-3 text-decoration-none"
                                        onClick={() => handleEditComment(reply)}
                                        style={{ fontSize: "13px" }}
                                      >
                                        ✏️ Edit
                                      </Button>
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="text-danger p-0 text-decoration-none"
                                        onClick={() =>
                                          handleDeleteComment(reply._id)
                                        }
                                        style={{ fontSize: "13px" }}
                                      >
                                        🗑️ Delete
                                      </Button>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex-grow-1 d-flex align-items-center justify-content-center border rounded"
                style={{
                  maxHeight: "calc(100vh - 300px)",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <p className="text-muted mb-0">
                  No comments yet. Start the conversation!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== Work Item Modal ===== */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditMode ? "Edit Work Item" : "Create Work Item"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={selectedWorkItem?.title || ""}
                onChange={(e) =>
                  setSelectedWorkItem({
                    ...selectedWorkItem,
                    title: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={selectedWorkItem?.description || ""}
                onChange={(e) =>
                  setSelectedWorkItem({
                    ...selectedWorkItem,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={selectedWorkItem?.priority || "Medium"}
                onChange={(e) =>
                  setSelectedWorkItem({
                    ...selectedWorkItem,
                    priority: e.target.value,
                  })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={selectedWorkItem?.status || "Pending"}
                onChange={(e) =>
                  setSelectedWorkItem({
                    ...selectedWorkItem,
                    status: e.target.value,
                  })
                }
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </Form.Select>
            </Form.Group>
            {user.role === "Admin" && (
              <Form.Group className="mb-3">
                <Form.Label>Assign To</Form.Label>
                <Form.Select
                  value={selectedWorkItem?.assignedTo || ""}
                  onChange={(e) =>
                    setSelectedWorkItem({
                      ...selectedWorkItem,
                      assignedTo: e.target.value,
                    })
                  }
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            💾 Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== User Role Edit Modal ===== */}
      <Modal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>User</Form.Label>
              <Form.Control type="text" value={editUser?.name || ""} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={editUser?.role || "Dev"}
                onChange={(e) =>
                  setEditUser({ ...editUser, role: e.target.value })
                }
              >
                <option value="Dev">Dev</option>
                <option value="Tester">Tester</option>
                <option value="Admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRoleSave}>
            💾 Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== Employee Edit Modal ===== */}
      <Modal
        show={showEmployeeModal}
        onHide={() => {
          setShowEmployeeModal(false);
          setEmployeeEditMode(false);
          setSelectedEmployee(null);
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Employee Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateEmployee}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>First Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter first name"
                  value={employeeFormData.firstName}
                  onChange={(e) => handleEmployeeFormChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Last Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter last name"
                  value={employeeFormData.lastName}
                  onChange={(e) => handleEmployeeFormChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>Employee ID *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter employee ID"
                  value={employeeFormData.employeeId}
                  onChange={(e) => handleEmployeeFormChange("employeeId", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={employeeFormData.email}
                  onChange={(e) => handleEmployeeFormChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Enter phone number"
                  value={employeeFormData.phone}
                  onChange={(e) => handleEmployeeFormChange("phone", e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  value={employeeFormData.dob}
                  onChange={(e) => handleEmployeeFormChange("dob", e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  value={employeeFormData.gender}
                  onChange={(e) => handleEmployeeFormChange("gender", e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Employment Type</Form.Label>
                <Form.Select
                  value={employeeFormData.employmentType}
                  onChange={(e) => handleEmployeeFormChange("employmentType", e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </Form.Select>
              </div>
            </div>

            <div className="row">
              <div className="col-12 mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter full address"
                  value={employeeFormData.address}
                  onChange={(e) => handleEmployeeFormChange("address", e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter department"
                  value={employeeFormData.department}
                  onChange={(e) => handleEmployeeFormChange("department", e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter role"
                  value={employeeFormData.role}
                  onChange={(e) => handleEmployeeFormChange("role", e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={employeeFormData.startDate}
                  onChange={(e) => handleEmployeeFormChange("startDate", e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Emergency Contact</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Enter emergency contact"
                  value={employeeFormData.emergencyContact}
                  onChange={(e) => handleEmployeeFormChange("emergencyContact", e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-12 mb-3">
                <Form.Label>Bank Account Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter bank account number"
                  value={employeeFormData.bankAccount}
                  onChange={(e) => handleEmployeeFormChange("bankAccount", e.target.value)}
                />
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowEmployeeModal(false);
              setEmployeeEditMode(false);
              setSelectedEmployee(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateEmployee}
            disabled={employeeManagementLoading}
          >
            {employeeManagementLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Updating...
              </>
            ) : (
              "💾 Update Employee"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}