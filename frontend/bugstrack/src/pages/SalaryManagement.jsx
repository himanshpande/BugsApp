import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Form, Table, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const SalaryManagement = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    month: "",
    year: "",
  });
  const [formData, setFormData] = useState({
    staffId: "",
    month: "",
    year: "",
    amount: "",
    remarks: "",
  });
  
  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      console.log("Fetching data with token:", token ? "Present" : "Missing");
      console.log("User role:", user?.role);
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      // Build query parameters for filtering
      const queryParams = new URLSearchParams();
      if (filters.month) queryParams.append('month', filters.month);
      if (filters.year) queryParams.append('year', filters.year);
      
      const queryString = queryParams.toString();
      const salaryUrl = isAdmin 
        ? `http://localhost:5000/api/salaries${queryString ? `?${queryString}` : ''}`
        : `http://localhost:5000/api/salaries/my${queryString ? `?${queryString}` : ''}`;
      
      const requests = [
        axios.get(salaryUrl, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ];
      
      // Only fetch staff list if user is Admin
      if (isAdmin) {
        requests.push(
          axios.get("http://localhost:5000/api/auth/users", {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
      }
      
      const responses = await Promise.all(requests);
      const salaryRes = responses[0];
      const staffRes = isAdmin ? responses[1] : null;
      
      console.log("Salary API response:", salaryRes.data);
      if (staffRes) console.log("Users API response:", staffRes.data);
      
      setRecords(salaryRes.data || []);
      setStaffList(staffRes?.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      console.error("Error details:", err.response?.data);
      
      setError(err.response?.data?.message || err.message);
      
      if (err.response?.status === 401) {
        alert("Authentication failed. Please login again.");
        navigate('/login');
      } else if (err.response?.status === 403) {
        alert("Access denied. You need proper permissions to access salary management.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/salaries", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ staffId: "", month: "", year: "", amount: "", remarks: "" });
      fetchData();
      alert("Salary record added successfully!");
    } catch (err) {
      console.error("Error adding salary:", err);
      alert("Failed to add salary record. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this salary record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/salaries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      alert("Salary record deleted successfully!");
    } catch (err) {
      console.error("Error deleting salary:", err);
      alert("Failed to delete salary record. Please try again.");
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    fetchData();
  };

  const clearFilters = () => {
    setFilters({ month: "", year: "" });
    // Fetch data without filters
    setTimeout(() => fetchData(), 100);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          💰 {isAdmin ? 'Salary Management' : 'My Salary Records'}
        </h2>
        <Button 
          variant="outline-primary" 
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>Error:</strong> {error}
          <div className="mt-2">
            <Button variant="outline-danger" size="sm" onClick={fetchData}>
              🔄 Retry
            </Button>
          </div>
        </Alert>
      )}

      {loading && (
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
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-4 mb-3">
              <Form.Label>Year</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter year (e.g., 2025)"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                min="2020"
                max="2030"
              />
            </div>
            <div className="col-md-4 mb-3 d-flex align-items-end">
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={applyFilters}>
                  🔍 Apply Filters
                </Button>
                <Button variant="outline-secondary" onClick={clearFilters}>
                  🗑️ Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

     

      {isAdmin && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Add New Salary Record</h5>
          </div>
        <div className="card-body">
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>Staff Member</Form.Label>
                <Form.Select
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  required
                >
                  <option value="">Select Staff</option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-md-3 mb-3">
                <Form.Label>Month</Form.Label>
                <Form.Select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  required
                >
                  <option value="">Select Month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-md-3 mb-3">
                <Form.Label>Year</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="2025"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
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
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
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

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            {isAdmin ? 'Salary Records' : 'My Salary Records'}
          </h5>
        </div>
        <div className="card-body p-0">
          {records.length > 0 ? (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  {isAdmin && <th>Staff Member</th>}
                  <th>Month</th>
                  <th>Year</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  {isAdmin && <th>Created By</th>}
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    {isAdmin && (
                      <td>
                        <div>
                          <strong>{r.staffId?.name}</strong>
                          <br />
                          <small className="text-muted">{r.staffId?.role}</small>
                        </div>
                      </td>
                    )}
                    <td>
                      <span className="badge bg-info">
                        {new Date(0, r.month - 1).toLocaleString('default', { month: 'long' })}
                      </span>
                    </td>
                    <td>{r.year}</td>
                    <td>
                      <strong className="text-success">₹{r.amount.toLocaleString()}</strong>
                    </td>
                    <td>
                      <span className={`badge ${
                        r.status === 'Paid' ? 'bg-success' : 
                        r.status === 'Pending' ? 'bg-warning text-dark' : 
                        'bg-danger'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.remarks || '-'}</td>
                    {isAdmin && (
                      <td>
                        <small>{r.createdBy?.name}</small>
                      </td>
                    )}
                    {isAdmin && (
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(r._id)}
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
  );
};

export default SalaryManagement;
