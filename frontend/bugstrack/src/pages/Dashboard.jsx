"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Dashboard.css";
import { Button, Table, Modal, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import { useNotification } from "./NotificationProvider";
import { Alert } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { faPlus,faSearch,faCirclePlus,faMoneyBillWave,faRotate,} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Overview from "./Overview";
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import { faBusinessTime } from '@fortawesome/free-solid-svg-icons';
import { faListCheck } from '@fortawesome/free-solid-svg-icons';
import { faUserGear } from '@fortawesome/free-solid-svg-icons';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { faIdCard } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { faTable } from '@fortawesome/free-solid-svg-icons';
import { faTh } from '@fortawesome/free-solid-svg-icons';
import { faBug } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { faStickyNote } from '@fortawesome/free-solid-svg-icons';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { faNewspaper } from '@fortawesome/free-solid-svg-icons';
import Notes from './Notes';
import Chat from './Chat';
import Posts from './Posts';
import GlobalHorizontalNav from '../components/GlobalHorizontalNav';
import HorizontalNav from '../components/HorizontalNav';



const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [globalNavItem, setGlobalNavItem] = useState("dashboard");
  const [chatSubNav, setChatSubNav] = useState("chats"); // chats or groups
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const storedPreference = localStorage.getItem("dashboard-theme");
    if (storedPreference) {
      return storedPreference === "dark";
    }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWorkItem, setSelectedWorkItem] = useState(null);
  const [workItems, setWorkItems] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // "table" or "kanban"
  const [draggedItem, setDraggedItem] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  // Bug management states
  const [showBugModal, setShowBugModal] = useState(false);
  const [selectedWorkItemForBug, setSelectedWorkItemForBug] = useState(null);
  const [expandedBugs, setExpandedBugs] = useState({});
  const [bugFormData, setBugFormData] = useState({
    title: '',
    description: '',
    severity: 'Medium'
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [employeeEditMode, setEmployeeEditMode] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [employeeError, setEmployeeError] = useState(null);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  //punch in punchout features are here below
  const [punchRecords, setPunchRecords] = useState([]);
  const [allUsersPunchRecords, setAllUsersPunchRecords] = useState([]);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [punchInTime, setPunchInTime] = useState(null);
  const [totalTimeToday, setTotalTimeToday] = useState("0h 0m 0s");
  const [showAllUsersPunch, setShowAllUsersPunch] = useState(false);

  const formatDateTime = (date) => {
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  };

  // Calculate total time worked today
  const calculateTotalTimeToday = (records) => {
    const today = new Date().toLocaleDateString();
    const todayRecords = records.filter(
      (record) => record.date === today && record.status === "Completed"
    );

    let totalMinutes = 0;

    todayRecords.forEach((record) => {
      if (record.duration && record.duration !== "-") {
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

    return `${totalHours}h ${remainingMinutes}m ${remainingSeconds}s`;
  };
  const calculateDuration = (start, end) => {
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${diffHrs}h ${diffMins}m ${diffSecs}s`;
  };
  const handlePunchIn = async () => {
    setLoading(true);
    fetchLocation();

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/punch/punch-in",
        { location },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const newRecord = response.data.data;
        setPunchRecords((prev) => [newRecord, ...prev]);
        setIsPunchedIn(true);
        setPunchInTime(new Date());
        showNotification({
          type: "success",
          message: "Punched in successfully!",
        });
      }
    } catch (err) {
      console.error("Error punching in:", err);
      showNotification({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to punch in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  const handlePunchOut = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/punch/punch-out",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const updatedRecord = response.data.data;

        // Update the local state
        setPunchRecords((prev) => {
          const updatedRecords = prev.map((record) =>
            record._id === updatedRecord._id ? updatedRecord : record
          );
          // Recalculate total time for today
          const totalTime = calculateTotalTimeToday(updatedRecords);
          setTotalTimeToday(totalTime);
          return updatedRecords;
        });

        setIsPunchedIn(false);
        setPunchInTime(null);

        // Fetch updated total time
        fetchTotalTimeToday();

        showNotification({
          type: "success",
          message: "Punched out successfully!",
        });
      }
    } catch (err) {
      console.error("Error punching out:", err);
      showNotification({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to punch out. Please try again.",
      });
    }
  };
  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        (err) => {
          console.error("Location access denied:", err);
          alert("Please allow location access to record Punch In location.");
        }
      );
    } else {
      alert("Geolocation not supported in your browser.");
    }
  };
  // Fetch punch records from backend
  const fetchPunchRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/punch/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setPunchRecords(response.data.data);
        // Calculate total time for today
        const totalTime = calculateTotalTimeToday(response.data.data);
        setTotalTimeToday(totalTime);
      }
    } catch (err) {
      console.error("Error fetching punch records:", err);
    }
  };

  // Check current punch status
  const checkPunchStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/punch/status",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setIsPunchedIn(response.data.isPunchedIn);
        if (response.data.currentRecord) {
          setPunchInTime(
            new Date(
              `${response.data.currentRecord.date} ${response.data.currentRecord.punchInTime}`
            )
          );
        }
      }
    } catch (err) {
      console.error("Error checking punch status:", err);
    }
  };

  // Fetch total time for today from backend
  const fetchTotalTimeToday = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/punch/total-time",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setTotalTimeToday(response.data.data.totalTime);
      }
    } catch (err) {
      console.error("Error fetching total time:", err);
    }
  };


  const [salaryFilters, setSalaryFilters] = useState({
    month: "",
    year: "",
  });
  const [attendanceFormData, setAttendanceFormData] = useState({
    date: "",
    checkIn: "",
    checkOut: "",
    status: "Present",
    remarks: "",
  });
  const [salaryFormData, setSalaryFormData] = useState({
    staffId: "",
    month: "",
    year: "",
    amount: "",
    remarks: "",
  });
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setEmployeeFormData((prev) => ({
          ...prev,
          avatarDataUrl: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  const [salaryStaffList, setSalaryStaffList] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [attendanceFilters, setAttendanceFilters] = useState({
    month: "",
    year: "",
    date: "",
  });

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
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryError, setSalaryError] = useState(null);
  const [employeeManagementLoading, setEmployeeManagementLoading] =
    useState(false);
  const { showNotification } = useNotification();
  const [user, setUser] = useState({ name: "Admin", role: "Admin" });
  const token = localStorage.getItem("token");
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const themeName = isDarkMode ? "dark" : "light";
    localStorage.setItem("dashboard-theme", themeName);
    if (typeof document !== "undefined") {
      document.body.dataset.theme = themeName;
      document.body.style.backgroundColor = isDarkMode ? "#0b1120" : "#f8f9fa";
      document.body.style.color = isDarkMode ? "#e2e8f0" : "#1f2937";
    }
  }, [isDarkMode]);

  const theme = useMemo(
    () => ({
      bodyBg: isDarkMode ? "#0b1120" : "#f8f9fa",
      surface: isDarkMode ? "#111827" : "#ffffff",
      surfaceAlt: isDarkMode ? "#0f172a" : "#f3f4f6",
      border: isDarkMode ? "#1f2937" : "#e5e7eb",
      textPrimary: isDarkMode ? "#e2e8f0" : "#1f2937",
      textSecondary: isDarkMode ? "#94a3b8" : "#6b7280",
      navActiveBg: isDarkMode ? "#1e293b" : "#f3f4f6",
      navHoverBg: isDarkMode ? "#1e293b" : "#f9fafb",
      headerBg: isDarkMode ? "#0f172a" : "#ffffff",
      headerBorder: isDarkMode ? "#1f2937" : "#e5e7eb",
      dangerBg: isDarkMode ? "#7f1d1d" : "#fee2e2",
      dangerHoverBg: isDarkMode ? "#991b1b" : "#fecaca",
      dangerText: isDarkMode ? "#fca5a5" : "#dc2626",
      inputBg: isDarkMode ? "#0f172a" : "#f3f4f6",
      inputBorder: isDarkMode ? "#1f2937" : "#e5e7eb",
      inputText: isDarkMode ? "#cbd5f5" : "#6b7280",
      toggleTrack: isDarkMode ? "#334155" : "#f3f4f6",
      toggleThumb: isDarkMode ? "#f8fafc" : "#ffffff",
      cardShadow: isDarkMode
        ? "0 1px 3px rgba(15, 23, 42, 0.6)"
        : "0 1px 3px rgba(0,0,0,0.05)",
      subtleText: isDarkMode ? "#cbd5f5" : "#6b7280",
      tableRowHover: isDarkMode ? "#1e293b" : "#f9fafb",
    }),
    [isDarkMode]
  );

  const thStyle = useMemo(
    () => ({
      padding: "1rem",
      textAlign: "left",
      fontSize: "0.85rem",
      fontWeight: "600",
      color: theme.textSecondary,
    }),
    [theme.textSecondary]
  );

  // Fetch all users punch records (Admin only)
  const fetchAllUsersPunchRecords = async () => {
    if (user.role !== "Admin") return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/punch/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setAllUsersPunchRecords(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching all users punch records:", err);
    }
  };

  // Get currently punched-in users count
  const getPunchedInUsersCount = () => {
    if (user.role !== "Admin") return 0;
    
    const punchedInUsers = allUsersPunchRecords.filter(
      record => record.status === "Active" || record.punchOutTime === "-"
    );
    
    // Get unique users by userId
    const uniqueUsers = new Set(punchedInUsers.map(r => r.userId?._id || r.userId));
    return uniqueUsers.size;
  };



  // Function to fetch current user information
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Auth me response:", response.data);

      if (response.data.success) {
        console.log("Setting user from success response:", response.data.user);
        setUser(response.data.user);
      } else {
        // Handle case where success field doesn't exist
        console.log("Setting user from direct response:", response.data);
        setUser(response.data);
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
      // Fallback to default user if API fails
      setUser({ name: "Admin", role: "Admin" });
    }
  };
  const handleDeleteEmployee = async (employeeId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this employee? This action cannot be undone."
      )
    ) {
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
          message: "Employee deleted successfully!",
        });
        fetchAllEmployees(); // Refresh the list
      }
    } catch (err) {
      console.error("Error deleting employee:", err);
      showNotification({
        type: "error",
        message:
          "Error deleting employee: " +
          (err.response?.data?.message || err.message),
      });
    } finally {
      setEmployeeManagementLoading(false);
    }
  };
  const handleSalaryFilterChange = (field, value) => {
    setSalaryFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const applySalaryFilters = () => {
    fetchSalaryData();
  };

  const applyAttendanceFilters = () => {
    // Filter logic would go here
    fetchAttendanceData();
  };
  const handleEmployeeSubmit = async (e) => {
    console.log("inside handleEmployeeSubmit...");
    e.preventDefault();
    try {
      console.log("try block entered...");
      setEmployeeLoading(true);
      setEmployeeError(null);
      const token = localStorage.getItem("token");
      console.log("Token:", token);

      let userId = user._id || user.id;
      console.log("User ID from user object:", userId);

      // If user ID is not available, try to get it from the token
      if (!userId) {
        try {
          // Decode JWT token to get user ID
          const tokenPayload = JSON.parse(atob(token.split(".")[1]));
          userId = tokenPayload.id;
          console.log("User ID from token:", userId);
        } catch (tokenErr) {
          console.error("Error decoding token:", tokenErr);
        }
      }

      if (!userId) {
        throw new Error("User ID not found in user object or token");
      }

      const submitData = {
        ...employeeFormData,
        userId: userId,
        userName: user.name,
      };

      console.log("Submitting employee data:", submitData);

      const response = await axios.post(
        "http://localhost:5000/api/employees/save",
        submitData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setEmployeeInfo(response.data.data);
        setIsEditMode(false); // Exit edit mode after successful save
        showNotification({
          type: "success",
          message: "Employee information saved successfully!",
        });
        fetchEmployeeInfo(); // Refresh the data
      }
    } catch (err) {
      console.error("Error saving employee info:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to save employee information. Please try again.";
      setEmployeeError(errorMessage);
      showNotification({
        type: "error",
        message: `Error: ${errorMessage}`,
      });
    } finally {
      setEmployeeLoading(false);
    }
  };
  const clearAttendanceFilters = () => {
    setAttendanceFilters({ month: "", year: "", date: "" });
    setTimeout(() => fetchAttendanceData(), 100);
  };
  const clearSalaryFilters = () => {
    setSalaryFilters({ month: "", year: "" });
    setTimeout(() => fetchSalaryData(), 100);
  };
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
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
        userName: user.name,
      };

      setAttendanceRecords((prev) => [newRecord, ...prev]);
      setAttendanceFormData({
        date: "",
        checkIn: "",
        checkOut: "",
        status: "Present",
        remarks: "",
      });
      showNotification({
        type: "success",
        message: "Attendance record added successfully!",
      });
    } catch (err) {
      console.error("Error adding attendance:", err);
      showNotification({
        type: "error",
        message: "Failed to add attendance record. Please try again.",
      });
    }
  };
  const handleSalaryDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this salary record?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/salaries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSalaryData();
      showNotification({
        type: "success",
        message: "Salary record deleted successfully!",
      });
    } catch (err) {
      console.error("Error deleting salary:", err);
      showNotification({
        type: "error",
        message: "Failed to delete salary record. Please try again.",
      });
    }
  };
  const handleAttendanceFilterChange = (field, value) => {
    setAttendanceFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/salaries", salaryFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalaryFormData({
        staffId: "",
        month: "",
        year: "",
        amount: "",
        remarks: "",
      });
      fetchSalaryData();
      showNotification({
        type: "success",
        message: "Salary record added successfully!",
      });
    } catch (err) {
      console.error("Error adding salary:", err);
      showNotification({
        type: "error",
        message: "Failed to add salary record. Please try again.",
      });
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
        message: "Comment added successfully!",
      });
    } catch (err) {
      console.error("Error adding comment", err);
      showNotification({
        type: "error",
        message: "Failed to add comment",
      });
    }
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
          message: "Employee updated successfully!",
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
        message:
          "Error updating employee: " +
          (err.response?.data?.message || err.message),
      });
    } finally {
      setEmployeeManagementLoading(false);
    }
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
        message: "Comment updated successfully!",
      });
    } catch (err) {
      console.error("Error editing comment", err);
      showNotification({
        type: "error",
        message: "Failed to edit comment",
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
        message: "Failed to delete comment",
      });
    }
  };

  const handleEditComment = async (comment) => {
    setEditingComment(comment._id);
    setEditText(comment.text);
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
          parentCommentId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh comments to get the updated structure
      fetchComments();
      setReplyText("");
      setReplyingTo(null);
      showNotification({
        type: "success",
        message: "Reply added successfully!",
      });
    } catch (err) {
      console.error("Error adding reply", err);
      showNotification({
        type: "error",
        message: "Failed to add reply",
      });
    }
  };

  const handleEmployeeFormChange = (field, value) => {
    setEmployeeFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const fetchAllEmployees = async () => {
    try {
      setEmployeeManagementLoading(true);
      const token = localStorage.getItem("token");

      // First test if employee routes are working
      try {
        const testResponse = await axios.get(
          "http://localhost:5000/api/employees/test",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Employee routes test:", testResponse.data);
      } catch (testErr) {
        console.log("Employee routes test failed:", testErr.message);
      }

      // Try the admin/all endpoint first
      try {
        const response = await axios.get(
          "http://localhost:5000/api/employees/admin/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setAllEmployees(response.data.data);
          return;
        }
      } catch (adminErr) {
        console.log(
          "Admin/all endpoint failed, trying fallback...",
          adminErr.message
        );
      }

      // Fallback to regular employees endpoint
      const response = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setAllEmployees(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching all employees:", err);
      showNotification({
        type: "error",
        message:
          "Error fetching employees: " +
          (err.response?.data?.message || err.message),
      });
    } finally {
      setEmployeeManagementLoading(false);
    }
  };
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
      if (salaryFilters.month) queryParams.append("month", salaryFilters.month);
      if (salaryFilters.year) queryParams.append("year", salaryFilters.year);

      const queryString = queryParams.toString();
      const salaryUrl =
        user.role === "Admin"
          ? `http://localhost:5000/api/salaries${
              queryString ? `?${queryString}` : ""
            }`
          : `http://localhost:5000/api/salaries/my${
              queryString ? `?${queryString}` : ""
            }`;

      const requests = [
        axios.get(salaryUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ];

      // Only fetch staff list if user is Admin
      if (user.role === "Admin") {
        requests.push(
          axios.get("http://localhost:5000/api/auth/users", {
            headers: { Authorization: `Bearer ${token}` },
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

  const fetchAttendanceData = () => {
    // Fetch attendance data logic here
  };

  const fetchEmployeeInfo = async () => {
    try {
      setEmployeeLoading(true);
      setEmployeeError(null);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        "http://localhost:5000/api/employees/my-info",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setEmployeeInfo(response.data.data);
        // Update form data if employee info exists
        if (response.data.data) {
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
          if (response.data.data.avatarDataUrl) {
            setImagePreview(response.data.data.avatarDataUrl);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching employee info:", err);
      // Don't set error for 404 - just means employee hasn't filled info yet
      if (err.response?.status !== 404) {
        setEmployeeError(
          err.response?.data?.message ||
          "Failed to fetch employee information"
        );
      }
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
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

    // Fetch users when creating work item if not already fetched
    if (users.length === 0 && (user.role === "Admin" || user.role === "Dev")) {
      console.log("Fetching users for work item creation");
      fetchUsers();
    }
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
          message: "Work item updated successfully!",
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
          message: "Work item created successfully!",
        });
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error saving work item", err);
      showNotification({
        type: "error",
        message: "Failed to save work item",
      });
    }
  };
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

    // Fetch users when editing work item if not already fetched
    if (users.length === 0 && (user.role === "Admin" || user.role === "Dev")) {
      debugger;
      console.log("Fetching users for work item editing");
      fetchUsers();
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
        message: "Work item deleted successfully!",
      });
    } catch (err) {
      console.error("Error deleting work item", err);
      showNotification({
        type: "error",
        message: "Failed to delete work item",
      });
    }
  };
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
        message: "User role updated successfully!",
      });
    } catch (err) {
      console.error("Failed to update user role", err);
      showNotification({
        type: "error",
        message: "Failed to update role",
      });
    }
  };
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Fetch user first, then work items after user is loaded
    const initializeData = async () => {
      await fetchCurrentUser();
      await fetchEmployeeInfo(); // Fetch employee info to get avatar
      // Small delay to ensure user state is updated
      setTimeout(() => {
        fetchWorkItems();
      }, 100);
    };

    initializeData();
  }, []);

  // Debug user state changes
  useEffect(() => {
    console.log("User state changed:", user);
    console.log("User role:", user.role);
    console.log("User role type:", typeof user.role);
  }, [user]);

  // Debug users state changes
  useEffect(() => {
    console.log("Users state changed:", users);
    console.log("Number of users:", users.length);
  }, [users]);

  useEffect(() => {
    console.log("User effect triggered, role:", user.role);
    if (user.role === "Admin" || user.role === "Dev") {
      console.log("Fetching users because user is Admin or Dev");
      fetchUsers();
    }

    // Refetch work items when user role changes
    if (user.role && !["Admin", "Dev"].includes(user.role)) {
      console.log("Refetching work items for non-Admin/Dev user");
      fetchWorkItems();
    }
  }, [user]);

  // Fetch punch records on component mount and when user role changes
  useEffect(() => {
    fetchLocation();
    fetchPunchRecords();
    checkPunchStatus();
    fetchTotalTimeToday();
    if (user.role === "Admin") {
      fetchAllUsersPunchRecords();
    }
  }, [user.role]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileDropdown]);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users with token:", token ? "Present" : "Missing");
      console.log("Current user role:", user.role);
      const res = await axios.get("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Users response:", res.data);
      console.log("Number of users fetched:", res.data.length);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      console.error("Error response:", err.response?.data);
    }
  };
  const fetchWorkItems = async () => {
    try {
      console.log("Fetching work items for user role:", user.role);

      let url = "http://localhost:5000/api/workitems/my";

      if (user.role === "Admin" || user.role === "Dev") {
        url = "http://localhost:5000/api/workitems";
      }

      console.log("Fetching from URL:", url);

      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Work items response:", res.data);
        setWorkItems(res.data);
      } catch (adminError) {
        if (
          (user.role === "Admin" || user.role === "Dev") &&
          adminError.response?.status === 403
        ) {
          console.log("Admin endpoint failed, trying /my endpoint as fallback");
          const fallbackRes = await axios.get(
            "http://localhost:5000/api/workitems/my",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("Fallback work items response:", fallbackRes.data);
          setWorkItems(fallbackRes.data);
        } else {
          throw adminError;
        }
      }
    } catch (err) {
      console.error("Failed to fetch work items", err);
      console.error("Error response:", err.response?.data);
    }
  };

 
  const kanbanColumns = [
    { id: "Ready for Dev", title: "Ready for Dev", status: "Pending" },
    { id: "Active Dev", title: "Active Dev", status: "In Progress" },
    { id: "Code Review", title: "Code Review", status: "Code Review" },
    { id: "QA Final Testing", title: "QA Final Testing", status: "Testing" },
    { id: "Completed", title: "Completed", status: "Completed" },
  ];

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedItem) return;

    try {
      const updatedItem = { ...draggedItem, status: newStatus };
      
      const res = await axios.put(
        `http://localhost:5000/api/workitems/${draggedItem._id}`,
        updatedItem,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWorkItems((prev) =>
        prev.map((w) => (w._id === res.data._id ? res.data : w))
      );

      showNotification({
        type: "success",
        message: `Work item moved to ${newStatus}!`,
      });
    } catch (err) {
      console.error("Error updating work item status", err);
      showNotification({
        type: "error",
        message: "Failed to update work item status",
      });
    }

    setDraggedItem(null);
  };

  const getWorkItemsByStatus = (status) => {
    return workItems.filter((item) => item.status === status);
  };

  // Bug management functions
  const handleAddBugClick = (workItem) => {
    setSelectedWorkItemForBug(workItem);
    setBugFormData({
      title: '',
      description: '',
      severity: 'Medium'
    });
    setShowBugModal(true);
  };

  const handleBugSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `http://localhost:5000/api/workitems/${selectedWorkItemForBug._id}/bugs`,
        bugFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the work items list with the updated work item
      setWorkItems((prev) =>
        prev.map((w) => (w._id === res.data._id ? res.data : w))
      );

      setShowBugModal(false);
      showNotification({
        type: 'success',
        message: 'Bug added successfully!'
      });
    } catch (err) {
      console.error('Error adding bug:', err);
      showNotification({
        type: 'error',
        message: 'Failed to add bug'
      });
    }
  };

  const handleDeleteBug = async (workItemId, bugId) => {
    if (!window.confirm('Are you sure you want to delete this bug?')) return;

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/workitems/${workItemId}/bugs/${bugId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the work items list
      setWorkItems((prev) =>
        prev.map((w) => (w._id === res.data._id ? res.data : w))
      );

      showNotification({
        type: 'success',
        message: 'Bug deleted successfully!'
      });
    } catch (err) {
      console.error('Error deleting bug:', err);
      showNotification({
        type: 'error',
        message: 'Failed to delete bug'
      });
    }
  };

  const handleUpdateBugStatus = async (workItemId, bugId, newStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/workitems/${workItemId}/bugs/${bugId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the work items list
      setWorkItems((prev) =>
        prev.map((w) => (w._id === res.data._id ? res.data : w))
      );

      showNotification({
        type: 'success',
        message: 'Bug status updated!'
      });
    } catch (err) {
      console.error('Error updating bug:', err);
      showNotification({
        type: 'error',
        message: 'Failed to update bug status'
      });
    }
  };

  const toggleBugList = (workItemId) => {
    setExpandedBugs((prev) => ({
      ...prev,
      [workItemId]: !prev[workItemId]
    }));
  };

  const navigate=useNavigate();

  const navItems = [
    {
      id:"overview",
      label:"Overview",
      icon:<FontAwesomeIcon icon={faChartBar} />,
      requiresAdmin:false,
      onClick:()=>{
        setActiveSection("overview");
        fetchAllEmployees();
        if (user.role === "Admin") {
          fetchAllUsersPunchRecords();
        }
      },
    },
    {
      id: "punchin",
      label: "Punch In/Out",
      icon: <FontAwesomeIcon icon={faBusinessTime} />,
      requiresAdmin: false,
      onClick: () => {
        setActiveSection("punchin");
        if (user.role === "Admin") {
          fetchAllUsersPunchRecords();
        }
      },
    },
    {
      id: "workitems",
      label: "Work Items",
      icon: <FontAwesomeIcon icon={faListCheck} />,
      requiresAdmin: false,
      onClick: () => setActiveSection("workitems"),
    },
    {
      id: "users",
      label: "Role settings",
      icon: <FontAwesomeIcon icon={faUserGear} />,
      requiresAdmin: true,
      onClick: () => setActiveSection("users"),
    },
    {
      id: "employee-management",
      label: "Employee Management",
      icon: <FontAwesomeIcon icon={faUsers} />,
      requiresAdmin: true,
      onClick: () => {
        setActiveSection("employee-management");
        fetchAllEmployees();
      },
    },
    {
      id: "payments",
      label: "Payments",
      icon: <FontAwesomeIcon icon={faCreditCard} />,
      requiresAdmin: false,
      onClick: () => {
        setActiveSection("payments");
        fetchSalaryData();
      },
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: <FontAwesomeIcon icon={faClock} />,
      requiresAdmin: false,
      onClick: () => {
        setActiveSection("attendance");
        fetchAttendanceData();
      },
    },
    {
      id: "employee-info",
      label: "Personal Info",
      icon: <FontAwesomeIcon icon={faIdCard} />,
      requiresAdmin: false,
      onClick: () => {
        setActiveSection("employee-info");
        fetchEmployeeInfo();
      },
    },
    {
      id: "notes",
      label: "Notes",
      icon: <FontAwesomeIcon icon={faStickyNote} />,
      requiresAdmin: false,
      onClick: () => setActiveSection("notes"),
    },
    {
      id: "chat",
      label: "Chat",
      icon: <FontAwesomeIcon icon={faCommentDots} />,
      requiresAdmin: false,
      onClick: () => {
        setActiveSection("chat");
        setGlobalNavItem("chat");
      },
    },
  ];

  // Global Horizontal Nav Items (Level 1 - Always visible)
  const globalHorizontalNavItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: faChartBar,
    },
    { 
      id: "posts",
      label: "Posts",
      icon: faNewspaper,
    },
    { 
      id: "chat", 
      label: "Chat", 
      icon: faCommentDots,
    },
    // Add more global items here in the future
  ];

  // Chat Sub-Navigation Items (Level 2 - Only visible when Chat is active)
  const chatSubNavItems = [
    { 
      id: "chats", 
      label: "Chats", 
      icon: faComments,
    },
    { 
      id: "groups", 
      label: "Groups", 
      icon: faUsers,
    },
  ];

  // Handle Global Nav (Level 1) clicks
  const handleGlobalNavClick = (itemId) => {
    if (itemId === "dashboard") {
      setGlobalNavItem("dashboard");
      setActiveSection("overview");
    } else if (itemId === "posts") {
      setGlobalNavItem("posts");
      setActiveSection("posts");
    } else if (itemId === "chat") {
      setGlobalNavItem("chat");
      setActiveSection("chat");
    }
    // Add more global nav handlers here in the future
  };

  // Handle Chat Sub-Nav (Level 2) clicks
  const handleChatSubNavClick = (itemId) => {
    if (itemId === "chats") {
      setChatSubNav("chats");
    } else if (itemId === "groups") {
      setChatSubNav("groups");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: theme.bodyBg,
        color: theme.textPrimary,
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      {/* ===== Sidebar ===== */}
      <div
        style={{
          width: "220px",
          backgroundColor: theme.surface,
          borderRight: `1px solid ${theme.border}`,
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          boxShadow: theme.cardShadow,
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "2rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "0.5rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "1.2rem",
              fontWeight: "bold",
            }}
          >
            B
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: "700",
              color: theme.textPrimary,
              transition: "color 0.3s ease",
            }}
          >
            BugStack
          </h3>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            flex: 1,
          }}
        >
          {navItems.map((item) => {
            if (item.requiresAdmin && user.role !== "Admin") return null;

            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setGlobalNavItem("dashboard");
                  item.onClick();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  backgroundColor: isActive ? theme.navActiveBg : "transparent",
                  color: isActive ? theme.textPrimary : theme.textSecondary,
                  fontSize: "0.95rem",
                  fontWeight: isActive ? "600" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = theme.navHoverBg;
                    e.currentTarget.style.color = theme.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = theme.textSecondary;
                  }
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            border: "none",
            backgroundColor: theme.dangerBg,
            color: theme.dangerText,
            fontSize: "0.95rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontFamily: "inherit",
            marginTop: "1rem",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.dangerHoverBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.dangerBg;
          }}
        >
          <span><FontAwesomeIcon icon={faArrowRightFromBracket} /></span>
          <span>Logout</span>
        </button>
      </div>

      {/* ===== Main Content ===== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            backgroundColor: theme.headerBg,
            borderBottom: `1px solid ${theme.headerBorder}`,
            padding: "1.5rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: theme.cardShadow,
            transition: "background-color 0.3s ease, border-color 0.3s ease",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: "700",
                color: theme.textPrimary,
                transition: "color 0.3s ease",
              }}
            >
              Dashboard
            </h2>
          </div>

          {/* Search and User Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
             <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.55rem 1rem",
            borderRadius: "0.5rem",
            border: "none",
            backgroundColor: theme.dangerBg,
            color: theme.dangerText,
            fontSize: "0.95rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontFamily: "inherit",
          
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.dangerHoverBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.dangerBg;
          }}
        >
          <span><FontAwesomeIcon icon={faArrowRightFromBracket} /></span>
          <span>Logout</span>
        </button>
             <div
              className="live-toggle"
              style={{ alignItems: "center", color: theme.textSecondary }}
            >
              <span className="toggle-label" style={{ color: theme.textSecondary }}>
                {isDarkMode ? "Dark" : "Light"} Mode
              </span>
              <label className="switch" aria-label="Toggle dark mode">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={() => setIsDarkMode((prev) => !prev)}
                />
                <span
                  className="slider"
                  style={{
                    backgroundColor: isDarkMode ? "#2563eb" : theme.toggleTrack,
                  }}
                ></span>
              </label>
              <span style={{ fontSize: "1rem", marginLeft: "0.5rem" }}>
                {isDarkMode ? "🌙" : "☀️"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: theme.surfaceAlt,
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: `1px solid ${theme.border}`,
                transition: "background-color 0.3s ease, border-color 0.3s ease",
              }}
            >
              <span style={{ color: theme.textSecondary }}></span>
              <input
                type="text"
                placeholder="Search..."
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                  outline: "none",
                  fontSize: "0.9rem",
                  color: theme.textSecondary,
                  width: "150px",
                }}
              />
            </div>
              <button className="notification-btn">🔔</button>

            {/* User Avatar with Dropdown */}
            <div
              ref={profileDropdownRef}
              style={{
                position: "relative",
              }}
            >
              <div
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: user.avatarDataUrl || employeeInfo?.avatarDataUrl ? "transparent" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  overflow: "hidden",
                  cursor: "pointer",
                  border: showProfileDropdown ? "2px solid #667eea" : "2px solid transparent",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!showProfileDropdown) {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {user.avatarDataUrl || employeeInfo?.avatarDataUrl ? (
                  <img
                    src={user.avatarDataUrl || employeeInfo?.avatarDataUrl}
                    alt={user.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  user.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "50px",
                    right: "0",
                    backgroundColor: theme.surface,
                    borderRadius: "0.75rem",
                    boxShadow: isDarkMode
                      ? "0 4px 12px rgba(15, 23, 42, 0.2)"
                      : "0 4px 12px rgba(0, 0, 0, 0.15)",
                    border: `1px solid ${theme.border}`,
                    minWidth: "220px",
                    zIndex: 1000,
                    overflow: "hidden",
                    animation: "slideDown 0.2s ease",
                  }}
                >
                  {/* User Info Section */}
                  <div
                    style={{
                      padding: "1rem",
                      borderBottom: `1px solid ${theme.border}`,
                      backgroundColor: theme.surfaceAlt,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: user.avatarDataUrl || employeeInfo?.avatarDataUrl ? "transparent" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                          overflow: "hidden",
                        }}
                      >
                        {user.avatarDataUrl || employeeInfo?.avatarDataUrl ? (
                          <img
                            src={user.avatarDataUrl || employeeInfo?.avatarDataUrl}
                            alt={user.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          user.name?.charAt(0).toUpperCase() || "U"
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            color: theme.textPrimary,
                            transition: "color 0.3s ease",
                            marginBottom: "0.15rem",
                          }}
                        >
                          {user.name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                          color: theme.textSecondary,
                          transition: "color 0.3s ease",
                          }}
                        >
                          {user.role}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div style={{ padding: "0.5rem 0" }}>
                    <button
                      onClick={() => {
                        setActiveSection("workitems");
                        setShowProfileDropdown(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        border: "none",
                        backgroundColor: "transparent",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        fontSize: "0.9rem",
                        color: theme.textSecondary,
                        transition: "all 0.2s ease",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.navHoverBg;
                        e.currentTarget.style.color = theme.textPrimary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = theme.textSecondary;
                      }}
                    >
                      <FontAwesomeIcon icon={faListCheck} style={{ fontSize: "1rem" }} />
                      <span>My Work Items</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveSection("employee-info");
                        setShowProfileDropdown(false);
                        fetchEmployeeInfo();
                      }}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        border: "none",
                        backgroundColor: "transparent",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        fontSize: "0.9rem",
                        color: theme.textSecondary,
                        transition: "all 0.2s ease",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.navHoverBg;
                        e.currentTarget.style.color = theme.textPrimary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = theme.textSecondary;
                      }}
                    >
                      <FontAwesomeIcon icon={faIdCard} style={{ fontSize: "1rem" }} />
                      <span>Personal Info</span>
                    </button>

                    <div
                      style={{
                        height: "1px",
                        backgroundColor: theme.border,
                        margin: "0.5rem 0",
                        transition: "background-color 0.3s ease",
                      }}
                    ></div>

                    <button
                      onClick={() => {
                        handleLogout();
                        setShowProfileDropdown(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        border: "none",
                        backgroundColor: "transparent",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        fontSize: "0.9rem",
                        color: theme.dangerText,
                        transition: "all 0.2s ease",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.dangerHoverBg;
                        e.currentTarget.style.color = theme.dangerText;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = theme.dangerText;
                      }}
                    >
                      <FontAwesomeIcon icon={faArrowRightFromBracket} style={{ fontSize: "1rem" }} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Level 1: Global Horizontal Navigation Bar */}
        <GlobalHorizontalNav
          items={globalHorizontalNavItems}
          activeItem={globalNavItem}
          onItemClick={handleGlobalNavClick}
          isDarkMode={isDarkMode}
        />

        {/* Level 2: Chat Sub-Navigation (only visible when Chat is active) */}
        {globalNavItem === "chat" && (
          <HorizontalNav
            items={chatSubNavItems}
            activeItem={chatSubNav}
            onItemClick={handleChatSubNavClick}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Content Area */}
        <div style={{ flex: 1, padding: globalNavItem === "chat" ? "0" : "2rem", overflowY: "auto" }}>
          {/* Greeting */}
          <div style={{ marginBottom: globalNavItem === "chat" ? "0" : "2rem" }}></div>
          
          {/* Overview Section */}
          {activeSection === "overview" && (
            <Overview 
              totalEmployees={allEmployees.length} 
              TotalWorkItems={workItems.length}
              totalPunchedInUsers={getPunchedInUsersCount()}
              isAdmin={user.role === "Admin"}
              isDarkMode={isDarkMode}
            />
          )}
          
          {activeSection === "posts" && (
            <Posts
              isDarkMode={isDarkMode}
              showNotification={showNotification}
              currentUser={user}
              currentUserAvatar={user.avatarDataUrl || employeeInfo?.avatarDataUrl}
            />
          )}
          
          {/* punchincode */}
          {activeSection === "punchin" && (
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">

                <h4>Punch In / Punch Out</h4>

                {loading ? (
                  <Button variant="secondary" disabled>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processing...
                  </Button>
                ) : isPunchedIn ? (
                  <Button variant="danger" onClick={handlePunchOut}>
                    Punch Out
                  </Button>
                ) : (
                  <Button variant="success" onClick={handlePunchIn}>
                    Punch In
                  </Button>
                  
                   
                )}
              </div>

              {/* 🌐 Current Location */}
              {location?.lat && (
                <div className="mb-3 text-muted small">
                  <strong>Current Location:</strong> Lat{" "}
                  {location.lat.toFixed(4)}, Lon {location.lon.toFixed(4)}
                </div>
              )}

          <div className="mb-2 text-sm flex items-center space-x-2 text-gray-700">
  <i className="fas fa-clock text-blue-600"></i>
  <span>Total Time:</span>
  <span className="font-medium text-gray-900">{totalTimeToday}</span>
  <span className="text-gray-500">
    (
    {
      punchRecords.filter(
        (record) =>
          record.date === new Date().toLocaleDateString() &&
          record.status === "Completed"
      ).length
    }{" "}
    completed)
  </span>
</div>



              📋 My Punch Records Table
              {/* <div className="table-responsive shadow-sm rounded mb-4">
                <h5 className="mb-3">My Punch Records</h5>
                <Table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f9fafb",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Punch In Time</th>
                      <th style={thStyle}>Punch Out Time</th>
                      <th style={thStyle}>Duration</th>
                      <th style={thStyle}>Latitude</th>
                      <th style={thStyle}>Longitude</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {punchRecords.length > 0 ? (
                      punchRecords.map((rec, index) => (
                        <tr key={rec._id || rec.id}>
                          <td>{index + 1}</td>
                          <td>{rec.date}</td>
                          <td>{rec.punchInTime}</td>
                          <td>{rec.punchOutTime}</td>
                          <td>{rec.duration}</td>
                          <td>
                            {rec.location?.lat
                              ? rec.location.lat.toFixed(4)
                              : "-"}
                          </td>
                          <td>
                            {rec.location?.lon
                              ? rec.location.lon.toFixed(4)
                              : "-"}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                rec.status === "Active" ||
                                rec.punchOutTime === "-"
                                  ? "bg-warning text-dark"
                                  : "bg-success"
                              }`}
                            >
                              {rec.status === "Active" ||
                              rec.punchOutTime === "-"
                                ? "Active"
                                : "Completed"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-muted">
                          No punch records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div> */}

              {/* 👥 Admin: All Users Punch Records */}
              {user.role === "Admin" && (
                <div className="mt-5">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>All Users Punch Records (Admin View)</h5>
                    <Button
                      variant={showAllUsersPunch ? "secondary" : "primary"}
                      onClick={() => setShowAllUsersPunch(!showAllUsersPunch)}
                    >
                      {showAllUsersPunch ? "Hide" : "Show"} All Users
                    </Button>
                  </div>

                  {/* Currently Punched In Users Card */}
                  {/* <div className="card bg-info text-white mb-4">
                    <div className="card-body">
                      <h6 className="card-title mb-2">
                        👤 Currently Punched In Users
                      </h6>
                      <h3 className="mb-0">{getPunchedInUsersCount()} Users</h3>
                      <small>Active now</small>
                    </div>
                  </div> */}

                  {showAllUsersPunch && (
                    <div className="table-responsive shadow-sm rounded">
                      <Table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr
                            style={{
                              backgroundColor: "#f9fafb",
                              borderBottom: "1px solid #e5e7eb",
                            }}
                          >
                            <th style={thStyle}>#</th>
                            <th style={thStyle}>User</th>
                            <th style={thStyle}>Date</th>
                            <th style={thStyle}>Punch In Time</th>
                            <th style={thStyle}>Punch Out Time</th>
                            <th style={thStyle}>Duration</th>
                            <th style={thStyle}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allUsersPunchRecords.length > 0 ? (
                            allUsersPunchRecords.map((rec, index) => (
                              <tr key={rec._id || rec.id}>
                                <td>{index + 1}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="me-2">
                                      {rec.userId?.avatarDataUrl ? (
                                        <img
                                          src={rec.userId.avatarDataUrl}
                                          alt={rec.userId?.name}
                                          className="rounded-circle"
                                          style={{
                                            width: "28px",
                                            height: "28px",
                                            objectFit: "cover",
                                          }}
                                        />
                                      ) : (
                                        <div
                                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                          style={{
                                            width: "28px",
                                            height: "28px",
                                            fontSize: "11px",
                                          }}
                                        >
                                          {rec.userId?.name
                                            ?.charAt(0)
                                            .toUpperCase() || "?"}
                                        </div>
                                      )}
                                    </div>
                                    <span>{rec.userId?.name || "Unknown"}</span>
                                  </div>
                                </td>
                                <td>{rec.date}</td>
                                <td>{rec.punchInTime}</td>
                                <td>{rec.punchOutTime}</td>
                                <td>{rec.duration}</td>
                                <td>
                                  <span
                                    className={`badge ${
                                      rec.status === "Active" ||
                                      rec.punchOutTime === "-"
                                        ? "bg-warning text-dark"
                                        : "bg-success"
                                    }`}
                                  >
                                    {rec.status === "Active" ||
                                    rec.punchOutTime === "-"
                                      ? "🟢 Active"
                                      : "✓ Completed"}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-muted text-center py-4">
                                No punch records found for any user.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Stats Cards */}
          {activeSection === "workitems" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Work Items</h4>
                <div className="d-flex gap-2">
                  {/* View Toggle Buttons */}
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn ${viewMode === "table" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setViewMode("table")}
                      style={{ display: "flex", alignItems: "center", gap: "5px" }}
                    >
                      <FontAwesomeIcon icon={faTable} />
                      Table
                    </button>
                    <button
                      type="button"
                      className={`btn ${viewMode === "kanban" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setViewMode("kanban")}
                      style={{ display: "flex", alignItems: "center", gap: "5px" }}
                    >
                      <FontAwesomeIcon icon={faTh} />
                      Board
                    </button>
                  </div>
                  
                  {(user.role === "Admin" || user.role === "Dev") && (
                    <Button
                      onClick={handleCreate}
                      style={{
                        background: "linear-gradient(90deg, #0e2383ff)",
                        border: "none",
                        color: "white",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 10px rgba(102, 126, 234, 0.4)",
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Create
                    </Button>
                  )}
                </div>
              </div>

              {/* Table View */}
             
{viewMode === "table" && (
  <div className="users-container">
    <div className="table-wrapper">
      <table className="modern-table">
        <thead>
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
                <td className="title-cell">{wi.title}</td>
                <td className="description-cell">{wi.description}</td>
                <td>
                  <span
                    className={`role-badge ${
                      wi.status === "Completed"
                        ? "status-completed"
                        : wi.status === "In Progress"
                        ? "status-progress"
                        : "status-pending"
                    }`}
                  >
                    {wi.status}
                  </span>
                </td>
                <td>
                  <span
                    className={`role-badge ${
                      wi.priority === "High"
                        ? "priority-high"
                        : wi.priority === "Medium"
                        ? "priority-medium"
                        : "priority-low"
                    }`}
                  >
                    {wi.priority}
                  </span>
                </td>
                <td>
                  <div className="user-info">
                    {/* <div className="avatar-fallback avatar-small avatar-info">
                          {wi.assignedTo?.name?.charAt(0).toUpperCase() || "?"}
                        </div> */}
                    <span className="user-name">{wi.assignedTo?.name || "N/A"}</span>
                  </div>
                </td>
                <td>
                  <div className="user-info">
                    {/* <div className="avatar-wrapper">
                      {wi.createdBy?.avatarDataUrl ? (
                        <img
                          src={wi.createdBy.avatarDataUrl}
                          alt={wi.createdBy?.name}
                          className="avatar-img avatar-small"
                        />
                      ) : (
                        <div className="avatar-fallback avatar-small avatar-success">
                          {wi.createdBy?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div> */}
                    <span className="user-name">{wi.createdBy?.name || "N/A"}</span>
                  </div>
                </td>
                <td>
                  {(user.role === "Admin" || user.role === "Dev") && (
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(wi)}
                        aria-label="Edit work item"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                       
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(wi._id)}
                        aria-label="Delete work item"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="empty-state">
                No work items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

              {/* Kanban Board View */}
              {viewMode === "kanban" && (
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    overflowX: "auto",
                    padding: "1rem 0",
                    minHeight: "70vh",
                  }}
                >
                  {kanbanColumns.map((column) => (
                    <div
                      key={column.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, column.status)}
                      style={{
                        flex: "1",
                        minWidth: "280px",
                        backgroundColor: theme.surfaceAlt,
                        borderRadius: "8px",
                        padding: "1rem",
                        border: `1px solid ${theme.border}`,
                        color: theme.textPrimary,
                        transition: "background-color 0.3s ease, border-color 0.3s ease",
                      }}
                    >
                      {/* Column Header */}
                      <div
                        style={{
                          marginBottom: "1rem",
                          paddingBottom: "0.75rem",
                          borderBottom: `2px solid ${theme.border}`,
                          transition: "border-color 0.3s ease",
                        }}
                      >
                        <h5
                          style={{
                            margin: 0,
                            fontSize: "0.95rem",
                            fontWeight: "600",
                            color: theme.textPrimary,
                            transition: "color 0.3s ease",
                          }}
                        >
                          {column.title}
                        </h5>
                        <small style={{ color: theme.textSecondary }}>
                          {getWorkItemsByStatus(column.status).length} items
                        </small>
                      </div>

                      {/* Work Item Cards */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.75rem",
                        }}
                      >
                        {getWorkItemsByStatus(column.status).map((item) => (
                          <div
                            key={item._id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            style={{
                              backgroundColor: theme.surface,
                              borderRadius: "6px",
                              padding: "0.75rem",
                              border: `1px solid ${theme.border}`,
                              cursor: "grab",
                              boxShadow: theme.cardShadow,
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow =
                                isDarkMode
                                  ? "0 4px 12px rgba(15,23,42,0.35)"
                                  : "0 4px 8px rgba(0,0,0,0.15)";
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = theme.cardShadow;
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
                          >
                            {/* Card Header */}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "start",
                                marginBottom: "0.5rem",
                              }}
                            >
                              <h6
                                style={{
                                  margin: 0,
                                  fontSize: "0.9rem",
                                  fontWeight: "600",
                                  color: "#212529",
                                  flex: 1,
                                }}
                              >
                                {item.title}
                              </h6>
                              <span
                                className={`badge ${
                                  item.priority === "High"
                                    ? "bg-danger"
                                    : item.priority === "Medium"
                                    ? "bg-warning text-dark"
                                    : "bg-info text-dark"
                                }`}
                                style={{
                                  fontSize: "0.7rem",
                                  marginLeft: "0.5rem",
                                }}
                              >
                                {item.priority}
                              </span>
                            </div>

                            {/* Card Description */}
                            <p
                              style={{
                                margin: "0 0 0.75rem 0",
                                fontSize: "0.8rem",
                                color: theme.textSecondary,
                                lineHeight: "1.4",
                              }}
                            >
                              {item.description?.length > 80
                                ? `${item.description.substring(0, 80)}...`
                                : item.description}
                            </p>

                            {/* Card Footer */}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingTop: "0.5rem",
                                  borderTop: `1px solid ${theme.border}`,
                              }}
                            >
                              {/* Assigned To */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                {item.assignedTo?.avatarDataUrl ? (
                                  <img
                                    src={item.assignedTo.avatarDataUrl}
                                    alt={item.assignedTo?.name}
                                    className="rounded-circle"
                                    style={{
                                      width: "24px",
                                      height: "24px",
                                      objectFit: "cover",
                                    }}
                                    title={item.assignedTo?.name}
                                  />
                                ) : (
                                  <div
                                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                    style={{
                                      width: "24px",
                                      height: "24px",
                                      fontSize: "10px",
                                    }}
                                    title={item.assignedTo?.name || "Unassigned"}
                                  >
                                    {item.assignedTo?.name
                                      ?.charAt(0)
                                      .toUpperCase() || "?"}
                                  </div>
                                )}
                                <small
                                  style={{
                                    fontSize: "0.75rem",
                                    color: theme.textSecondary,
                                  }}
                                >
                                  {item.assignedTo?.name || "Unassigned"}
                                </small>

                                {/* Bug Indicator */}
                                {item.bugs && item.bugs.length > 0 && (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleBugList(item._id);
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.25rem",
                                      backgroundColor: "#dc3545",
                                      color: "white",
                                      padding: "0.15rem 0.4rem",
                                      borderRadius: "10px",
                                      fontSize: "0.7rem",
                                      cursor: "pointer",
                                      marginLeft: "0.25rem",
                                    }}
                                    title="Click to view bugs"
                                  >
                                    <FontAwesomeIcon icon={faBug} />
                                    <span>{item.bugs.length}</span>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div style={{ display: "flex", gap: "0.25rem" }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddBugClick(item);
                                  }}
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    padding: "0.25rem",
                                    color: "#dc3545",
                                  }}
                                  title="Add Bug"
                                >
                                  <FontAwesomeIcon icon={faBug} />
                                </button>
                                {(user.role === "Admin" || user.role === "Dev") && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(item);
                                      }}
                                      style={{
                                        border: "none",
                                        background: "transparent",
                                        cursor: "pointer",
                                        padding: "0.25rem",
                                        color: "#0d6efd",
                                      }}
                                      title="Edit"
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(item._id);
                                      }}
                                      style={{
                                        border: "none",
                                        background: "transparent",
                                        cursor: "pointer",
                                        padding: "0.25rem",
                                        color: "#dc3545",
                                      }}
                                      title="Delete"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Expanded Bug List */}
                            {expandedBugs[item._id] && item.bugs && item.bugs.length > 0 && (
                              <div
                                style={{
                                  marginTop: "0.75rem",
                                  paddingTop: "0.75rem",
                                  borderTop: `1px solid ${theme.border}`,
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "0.5rem",
                                  }}
                                >
                                  <strong
                                    style={{
                                      fontSize: "0.8rem",
                                      color: theme.textPrimary,
                                    }}
                                  >
                                    Bugs ({item.bugs.length})
                                  </strong>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleBugList(item._id);
                                    }}
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                      cursor: "pointer",
                                      padding: "0",
                                      color: "#6c757d",
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faTimes} />
                                  </button>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem",
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {item.bugs.map((bug) => (
                                    <div
                                      key={bug._id}
                                      style={{
                                        backgroundColor: "#f8f9fa",
                                        padding: "0.5rem",
                                        borderRadius: "4px",
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "start",
                                          marginBottom: "0.25rem",
                                        }}
                                      >
                                        <strong style={{ color: "#212529" }}>
                                          {bug.title}
                                        </strong>
                                        <div style={{ display: "flex", gap: "0.25rem" }}>
                                          <span
                                            className={`badge ${
                                              bug.severity === "Critical"
                                                ? "bg-danger"
                                                : bug.severity === "High"
                                                ? "bg-warning text-dark"
                                                : "bg-info text-dark"
                                            }`}
                                            style={{ fontSize: "0.65rem" }}
                                          >
                                            {bug.severity}
                                          </span>
                                        </div>
                                      </div>
                                      <p
                                        style={{
                                          margin: "0.25rem 0",
                                          color: theme.textSecondary,
                                        }}
                                      >
                                        {bug.description}
                                      </p>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        }}
                                      >
                                        <select
                                          value={bug.status}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            handleUpdateBugStatus(
                                              item._id,
                                              bug._id,
                                              e.target.value
                                            );
                                          }}
                                          style={{
                                            fontSize: "0.7rem",
                                            padding: "0.15rem 0.3rem",
                                          border: `1px solid ${theme.border}`,
                                            borderRadius: "3px",
                                          }}
                                        >
                                          <option value="Open">Open</option>
                                          <option value="In Progress">In Progress</option>
                                          <option value="Fixed">Fixed</option>
                                          <option value="Closed">Closed</option>
                                        </select>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteBug(item._id, bug._id);
                                          }}
                                          style={{
                                            border: "none",
                                            background: "transparent",
                                            cursor: "pointer",
                                            padding: "0.15rem",
                                            color: "#dc3545",
                                          }}
                                          title="Delete Bug"
                                        >
                                          <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Empty State */}
                        {getWorkItemsByStatus(column.status).length === 0 && (
                          <div
                            style={{
                              padding: "2rem 1rem",
                              textAlign: "center",
                              color: "#adb5bd",
                              fontSize: "0.85rem",
                            }}
                          >
                            No items
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

         
          {activeSection === "users" && (
            <div>
              <h2
                style={{
                  margin: "0 0 1.5rem 0",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  color: "#1f2937",
                }}
              >
                Role Settings
              </h2>
              
            </div>
          )}
       {activeSection === "users" && user.role === "Admin" && (
  <div className="users-container">
    <div className="table-wrapper">
      <table className="modern-table">
        <thead>
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
                <div className="user-info">
                  {/* <div className="avatar-wrapper">
                    {u.avatarDataUrl ? (
                      <img
                        src={u.avatarDataUrl}
                        alt={u.name}
                        className="avatar-img"
                      />
                    ) : (
                      <div className="avatar-fallback">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div> */}
                  <span className="user-name">{u.name}</span>
                </div>
              </td>
              <td className="email-cell">{u.email}</td>
              <td>
                <span className={`role-badge ${u.role === "Admin" ? "admin" : "user"}`}>
                  {u.role}
                </span>
              </td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => handleRoleEdit(u)}
                  aria-label="Edit user role"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  <span>Edit</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

{activeSection === "employee-management" && (
  <div className="users-container">
    <div className="table-wrapper">
      <div className="table-header">
        <h3 className="table-title">Employee Management</h3>
      </div>
      <table className="modern-table">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Name</th>
            <th>Employee ID</th>
            <th>Email</th>
            <th>Department</th>
            <th>Tech</th>
            <th>Employee</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {allEmployees.length > 0 ? (
            allEmployees.map((employee) => (
              <tr key={employee._id}>
                <td>
                  <div className="avatar-wrapper">
                    {employee.avatarDataUrl ? (
                      <img
                        src={employee.avatarDataUrl}
                        alt={`${employee.firstName} ${employee.lastName}`}
                        className="avatar-img"
                      />
                    ) : (
                      <div className="avatar-fallback">
                        {employee.firstName?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                </td>
                <td className="title-cell">
                  {employee.firstName} {employee.lastName}
                </td>
                <td>
                  <span className="role-badge employee-id-badge">
                    {employee.employeeId}
                  </span>
                </td>
                <td className="email-cell">
                  {employee.email || "Not provided"}
                </td>
                <td className="department-cell">
                  {employee.department || "Not provided"}
                </td>
                <td>
                  <span className="role-badge tech-badge">
                    {employee.role || "Not provided"}
                  </span>
                </td>
                <td>
                  <div className="user-info">
                    {/* <div className="avatar-wrapper">
                      {employee.userId?.avatarDataUrl ? (
                        <img
                          src={employee.userId.avatarDataUrl}
                          alt={employee.userId?.name}
                          className="avatar-img avatar-tiny"
                        />
                      ) : (
                        <div className="avatar-fallback avatar-tiny avatar-success">
                          {employee.userId?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div> */}
                    {/* <div>
                          {employee.userId?.name?.charAt(0).toUpperCase() || "?"}
                        </div> */}
                    <div className="employee-user-info">
                      <span className="employee-user-name">
                        {employee.userId?.name || employee.userName || "Unknown"}
                      </span>
                      <span className="employee-user-role">
                        {employee.userId?.role || "Unknown"}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditEmployee(employee)}
                      title="Edit Employee"
                      aria-label="Edit employee"
                    >
                      <FontAwesomeIcon icon={faPen} /> 
                      
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteEmployee(employee._id)}
                      title="Delete Employee"
                      aria-label="Delete employee"
                    >
                      <FontAwesomeIcon icon={faTrash} /> 
                      
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="empty-state">
                No employees found. Employees will appear here once they fill out their personal information.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

         

         {activeSection === "payments" && (
  <div className="salary-container">
    <div className="salary-header">
      <h4 className="salary-main-title">
        {user.role === "Admin" ? "Salary Management" : "My Salary Records"}
      </h4>
    </div>

    {/* Error Alert */}
    {salaryError && (
      <div className="alert-box alert-danger">
        <strong>Error:</strong> {salaryError}
        <button className="retry-btn" onClick={fetchSalaryData}>
          <FontAwesomeIcon icon={faRotate} /> Retry
        </button>
      </div>
    )}

    {/* Loading Spinner */}
    {salaryLoading && (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading salary data...</p>
      </div>
    )}

    {/* Filter Section */}
    <div className="card-modern">
      <div className="card-header-modern">
        <h5><FontAwesomeIcon icon={faSearch} /> Filter Records</h5>
      </div>
      <div className="card-body-modern">
        <div className="filter-grid">
          <div className="filter-item">
            <label className="form-label">Month</label>
            <select
              className="form-select-modern"
              value={salaryFilters.month}
              onChange={(e) => handleSalaryFilterChange("month", e.target.value)}
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label className="form-label">Year</label>
            <input
              type="number"
              className="form-input-modern"
              placeholder="Enter year (e.g., 2025)"
              value={salaryFilters.year}
              onChange={(e) => handleSalaryFilterChange("year", e.target.value)}
              min="2020"
              max="2030"
            />
          </div>
          <div className="filter-actions">
            <button className="btn-primary-modern" onClick={applySalaryFilters}>
              Apply Filters
            </button>
            <button className="btn-secondary-modern" onClick={clearSalaryFilters}>
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Add Salary Form (Admin Only) */}
    {user.role === "Admin" && (
      <div className="card-modern">
        <div className="card-header-modern">
          <h5><FontAwesomeIcon icon={faCirclePlus} /> Add New Salary Record</h5>
        </div>
        <div className="card-body-modern">
          <form onSubmit={handleSalarySubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Staff Member</label>
                <select
                  className="form-select-modern"
                  value={salaryFormData.staffId}
                  onChange={(e) =>
                    setSalaryFormData({ ...salaryFormData, staffId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Staff</option>
                  {salaryStaffList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Month</label>
                <select
                  className="form-select-modern"
                  value={salaryFormData.month}
                  onChange={(e) =>
                    setSalaryFormData({ ...salaryFormData, month: e.target.value })
                  }
                  required
                >
                  <option value="">Select Month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  className="form-input-modern"
                  placeholder="2025"
                  value={salaryFormData.year}
                  onChange={(e) =>
                    setSalaryFormData({ ...salaryFormData, year: e.target.value })
                  }
                  required
                  min="2020"
                  max="2030"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  className="form-input-modern"
                  placeholder="Enter amount"
                  value={salaryFormData.amount}
                  onChange={(e) =>
                    setSalaryFormData({ ...salaryFormData, amount: e.target.value })
                  }
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group form-group-full">
                <label className="form-label">Remarks (Optional)</label>
                <input
                  type="text"
                  className="form-input-modern"
                  placeholder="Enter remarks"
                  value={salaryFormData.remarks}
                  onChange={(e) =>
                    setSalaryFormData({ ...salaryFormData, remarks: e.target.value })
                  }
                />
              </div>
            </div>
            <button type="submit" className="btn-primary-modern">
              <FontAwesomeIcon icon={faPlus} /> Add Salary
            </button>
          </form>
        </div>
      </div>
    )}

    {/* Salary Records Table */}
    <div className="card-modern">
      <div className="card-header-modern">
        <h5>
          <FontAwesomeIcon icon={faMoneyBillWave} /> {user.role === "Admin" ? "Salary Records" : "My Salary Records"}
        </h5>
      </div>
      <div className="table-wrapper table-wrapper-no-padding">
        {salaryRecords.length > 0 ? (
          <table className="modern-table">
            <thead>
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
                      <div className="user-info">
                        <div className="avatar-wrapper">
                          {r.staffId?.avatarDataUrl ? (
                            <img
                              src={r.staffId.avatarDataUrl}
                              alt={r.staffId?.name}
                              className="avatar-img avatar-small"
                            />
                          ) : (
                            <div className="avatar-fallback avatar-small">
                              {r.staffId?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="employee-user-info">
                          <span className="employee-user-name">
                            {r.staffId?.name}
                          </span>
                          <span className="employee-user-role">
                            {r.staffId?.role}
                          </span>
                        </div>
                      </div>
                    </td>
                  )}
                  <td>
                    <span className="role-badge month-badge">
                      {new Date(0, r.month - 1).toLocaleString("default", {
                        month: "long",
                      })}
                    </span>
                  </td>
                  <td className="year-cell">{r.year}</td>
                  <td>
                    <span className="amount-value">
                      ₹{r.amount.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`role-badge ${
                        r.status === "Paid"
                          ? "status-completed"
                          : r.status === "Pending"
                          ? "status-progress"
                          : "status-cancelled"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="remarks-cell">{r.remarks || "-"}</td>
                  {user.role === "Admin" && (
                    <td>
                      <div className="user-info">
                        <div className="avatar-wrapper">
                          {r.createdBy?.avatarDataUrl ? (
                            <img
                              src={r.createdBy.avatarDataUrl}
                              alt={r.createdBy?.name}
                              className="avatar-img avatar-tiny"
                            />
                          ) : (
                            <div className="avatar-fallback avatar-tiny tech-badge">
                              {r.createdBy?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="user-name">{r.createdBy?.name}</span>
                      </div>
                    </td>
                  )}
                  {user.role === "Admin" && (
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleSalaryDelete(r._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        <span>Delete</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No salary records found.</div>
        )}
      </div>
    </div>
  </div>
)}


         {activeSection === "attendance" && (
  <div className="users-container">
    <div className="table-wrapper">
      <div className="table-header">
        <h3 className="table-title">Attendance</h3>
      </div>

      {/* Error Alert */}
      {attendanceError && (
        <div className="alert-box alert-danger">
          <strong>Error:</strong> {attendanceError}
          <button className="retry-btn" onClick={fetchAttendanceData}>
            <FontAwesomeIcon icon={faRotate} /> Retry
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {attendanceLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading attendance data...</p>
        </div>
      )}

      {/* Filter Section */}
      <div className="card-modern">
        <div className="card-header-modern">
          <h5><FontAwesomeIcon icon={faSearch} /> Filter Records</h5>
        </div>
        <div className="card-body-modern">
          <div className="attendance-filter-grid">
            <div className="filter-item">
              <label className="form-label">Month</label>
              <select
                className="form-select-modern"
                value={attendanceFilters.month}
                onChange={(e) => handleAttendanceFilterChange("month", e.target.value)}
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label className="form-label">Year</label>
              <input
                type="number"
                className="form-input-modern"
                placeholder="Enter year (e.g., 2025)"
                value={attendanceFilters.year}
                onChange={(e) => handleAttendanceFilterChange("year", e.target.value)}
                min="2020"
                max="2030"
              />
            </div>
            <div className="filter-item">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input-modern"
                value={attendanceFilters.date}
                onChange={(e) => handleAttendanceFilterChange("date", e.target.value)}
              />
            </div>
            <div className="filter-actions">
              <button className="btn-primary-modern" onClick={applyAttendanceFilters}>
                Apply Filters
              </button>
              <button className="btn-secondary-modern" onClick={clearAttendanceFilters}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Attendance Form */}
      <div className="card-modern">
        <div className="card-header-modern">
          <h5><FontAwesomeIcon icon={faCirclePlus} /> Add New Attendance Record</h5>
        </div>
        <div className="card-body-modern">
          <form onSubmit={handleAttendanceSubmit}>
            <div className="attendance-form-grid">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input-modern"
                  value={attendanceFormData.date}
                  onChange={(e) =>
                    setAttendanceFormData({ ...attendanceFormData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Check In Time</label>
                <input
                  type="time"
                  className="form-input-modern"
                  value={attendanceFormData.checkIn}
                  onChange={(e) =>
                    setAttendanceFormData({ ...attendanceFormData, checkIn: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Check Out Time</label>
                <input
                  type="time"
                  className="form-input-modern"
                  value={attendanceFormData.checkOut}
                  onChange={(e) =>
                    setAttendanceFormData({ ...attendanceFormData, checkOut: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select-modern"
                  value={attendanceFormData.status}
                  onChange={(e) =>
                    setAttendanceFormData({ ...attendanceFormData, status: e.target.value })
                  }
                  required
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                </select>
              </div>
              <div className="form-group form-group-full">
                <label className="form-label">Remarks (Optional)</label>
                <input
                  type="text"
                  className="form-input-modern"
                  placeholder="Enter remarks"
                  value={attendanceFormData.remarks}
                  onChange={(e) =>
                    setAttendanceFormData({ ...attendanceFormData, remarks: e.target.value })
                  }
                />
              </div>
            </div>
            <button type="submit" className="btn-primary-modern">
              <FontAwesomeIcon icon={faCirclePlus} /> Add Attendance Record
            </button>
          </form>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="card-modern">
        <div className="card-header-modern">
          <h5><FontAwesomeIcon icon={faClipboardCheck} /> My Attendance Records</h5>
        </div>
        <div className="table-wrapper table-wrapper-no-padding">
          {attendanceRecords.length > 0 ? (
            <table className="modern-table">
              <thead>
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
                    <td className="date-cell">
                      {new Date(r.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td>
                      {r.checkIn ? (
                        <span className="time-value check-in">
                          {r.checkIn}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {r.checkOut ? (
                        <span className="time-value check-out">
                          {r.checkOut}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`role-badge ${
                          r.status === "Present"
                            ? "status-completed"
                            : r.status === "Absent"
                            ? "status-cancelled"
                            : r.status === "Late"
                            ? "status-progress"
                            : "status-halfday"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {r.checkIn && r.checkOut ? (
                        <span className="hours-worked">
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
                    <td className="remarks-cell">{r.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">No attendance records found.</div>
          )}
        </div>
      </div>
    </div>
  </div>
)}
          
          {/* Notes Section */}
          {activeSection === "notes" && (
            <Notes isDarkMode={isDarkMode} showNotification={showNotification} />
          )}

          {/* Chat Section */}
          {activeSection === "chat" && (
            <Chat 
              isDarkMode={isDarkMode} 
              showNotification={showNotification}
              currentUser={user}
              activeTab={chatSubNav}
              onTabChange={handleChatSubNavClick}
            />
          )}
        </div>
        {activeSection === "employee-info" && (
          <div
            className="d-flex flex-column"
            style={{
              height: "calc(100vh - 200px)",
              maxHeight: "calc(100vh - 200px)",
              overflowY: "auto",
              paddingRight: "8px",
              scrollbarWidth: "thin",
              scrollbarColor: "#6c757d #f8f9fa",
            }}
          >
            <div
              className="d-flex justify-content-between align-items-center mb-3 sticky-top bg-white py-2"
              style={{ zIndex: 10 }}
            >
              <h4 className="mb-0">👤 Personal Information</h4>
              {employeeInfo && !isEditMode && (
                <Button variant="outline-primary" onClick={handleEditClick}>
                  ✏️ Edit Information
                </Button>
              )}
            </div>

            {/* {employeeError && (
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
            )} */}

            

            {(isEditMode || !employeeInfo) && (
              <div className="card mb-3">
                <div
                  className="card-header d-flex justify-content-between align-items-center sticky-top bg-light"
                  style={{ zIndex: 5 }}
                >
                  <h5 className="mb-0">Personal Information Form</h5>
                  {isEditMode && (
                    <Button
                      variant="outline-secondary"
                      onClick={toggleEditMode}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                <div
                  className="card-body"
                  style={{
                    maxHeight: "calc(100vh - 400px)",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#6c757d #f8f9fa",
                  }}
                >
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
                                  border: "2px solid #dee2e6",
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
                          onChange={(e) =>
                            handleEmployeeFormChange(
                              "firstName",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <Form.Label>Last Name *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter last name"
                          value={employeeFormData.lastName}
                          onChange={(e) =>
                            handleEmployeeFormChange("lastName", e.target.value)
                          }
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
                          onChange={(e) =>
                            handleEmployeeFormChange(
                              "employeeId",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email"
                          value={employeeFormData.email}
                          onChange={(e) =>
                            handleEmployeeFormChange("email", e.target.value)
                          }
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
                          onChange={(e) =>
                            handleEmployeeFormChange("phone", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control
                          type="date"
                          value={employeeFormData.dob}
                          onChange={(e) =>
                            handleEmployeeFormChange("dob", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                          value={employeeFormData.gender}
                          onChange={(e) =>
                            handleEmployeeFormChange("gender", e.target.value)
                          }
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
                          onChange={(e) =>
                            handleEmployeeFormChange(
                              "employmentType",
                              e.target.value
                            )
                          }
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
                          onChange={(e) =>
                            handleEmployeeFormChange("address", e.target.value)
                          }
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
                          onChange={(e) =>
                            handleEmployeeFormChange(
                              "department",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter role"
                          value={employeeFormData.role}
                          onChange={(e) =>
                            handleEmployeeFormChange("role", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={employeeFormData.startDate}
                          onChange={(e) =>
                            handleEmployeeFormChange(
                              "startDate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <Form.Label>Emergency Contact</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="Enter emergency contact"
                          value={employeeFormData.emergencyContact}
                          onChange={(e) =>
                            handleEmployeeFormChange(
                              "emergencyContact",
                              e.target.value
                            )
                          }
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
                          onChange={(e) =>
                            handleEmployeeFormChange(
                              "bankAccount",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={employeeLoading}
                    >
                      {employeeLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
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
                <div
                  className="card-header sticky-top bg-light"
                  style={{ zIndex: 5 }}
                >
                  <h5 className="mb-0">Current Information</h5>
                </div>
                <div
                  className="card-body"
                  style={{
                    maxHeight: "calc(100vh - 300px)",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#6c757d #f8f9fa",
                  }}
                >
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Name:</strong> {employeeInfo.firstName}{" "}
                        {employeeInfo.lastName}
                      </p>
                      <p>
                        <strong>Employee ID:</strong> {employeeInfo.employeeId}
                      </p>
                      <p>
                        <strong>Email:</strong> {employeeInfo.email}
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        {employeeInfo.phone || "Not provided"}
                      </p>
                      <p>
                        <strong>Department:</strong>{" "}
                        {employeeInfo.department || "Not provided"}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Role:</strong>{" "}
                        {employeeInfo.role || "Not provided"}
                      </p>
                      <p>
                        <strong>Start Date:</strong>{" "}
                        {employeeInfo.startDate || "Not provided"}
                      </p>
                      <p>
                        <strong>Employment Type:</strong>{" "}
                        {employeeInfo.employmentType || "Not provided"}
                      </p>
                      <p>
                        <strong>Emergency Contact:</strong>{" "}
                        {employeeInfo.emergencyContact || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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
                  <option value="Pending">Ready for Dev</option>
                  <option value="In Progress">Active Dev</option>
                  <option value="Code Review">Code Review</option>
                  <option value="Testing">QA Final Testing</option>
                  <option value="Completed">Completed</option>
                </Form.Select>
              </Form.Group>
              {(user.role === "Admin" || user.role === "Dev") && (
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
                    {users.length > 0 ? (
                      users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role})
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading users...</option>
                    )}
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
              <FontAwesomeIcon icon={faSave} /> Save
            </Button>
          </Modal.Footer>
        </Modal>
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
                <Form.Control
                  type="text"
                  value={editUser?.name || ""}
                  disabled
                />
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
              <FontAwesomeIcon icon={faSave} /> Save
            </Button>
          </Modal.Footer>
        </Modal>
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
                    onChange={(e) =>
                      handleEmployeeFormChange("firstName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter last name"
                    value={employeeFormData.lastName}
                    onChange={(e) =>
                      handleEmployeeFormChange("lastName", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleEmployeeFormChange("employeeId", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={employeeFormData.email}
                    onChange={(e) =>
                      handleEmployeeFormChange("email", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleEmployeeFormChange("phone", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    value={employeeFormData.dob}
                    onChange={(e) =>
                      handleEmployeeFormChange("dob", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    value={employeeFormData.gender}
                    onChange={(e) =>
                      handleEmployeeFormChange("gender", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleEmployeeFormChange("employmentType", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleEmployeeFormChange("address", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleEmployeeFormChange("department", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter role"
                    value={employeeFormData.role}
                    onChange={(e) =>
                      handleEmployeeFormChange("role", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={employeeFormData.startDate}
                    onChange={(e) =>
                      handleEmployeeFormChange("startDate", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <Form.Label>Emergency Contact</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter emergency contact"
                    value={employeeFormData.emergencyContact}
                    onChange={(e) =>
                      handleEmployeeFormChange(
                        "emergencyContact",
                        e.target.value
                      )
                    }
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
                    onChange={(e) =>
                      handleEmployeeFormChange("bankAccount", e.target.value)
                    }
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
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Updating...
                </>
              ) : (
                "Update Employee"
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Add Bug Modal */}
        <Modal
          show={showBugModal}
          onHide={() => setShowBugModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Bug</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleBugSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Bug Title *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter bug title"
                  value={bugFormData.title}
                  onChange={(e) =>
                    setBugFormData({ ...bugFormData, title: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Describe the bug"
                  value={bugFormData.description}
                  onChange={(e) =>
                    setBugFormData({
                      ...bugFormData,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Severity</Form.Label>
                <Form.Select
                  value={bugFormData.severity}
                  onChange={(e) =>
                    setBugFormData({ ...bugFormData, severity: e.target.value })
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBugModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleBugSubmit}>
              <FontAwesomeIcon icon={faBug} className="me-2" />
              Add Bug
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;
