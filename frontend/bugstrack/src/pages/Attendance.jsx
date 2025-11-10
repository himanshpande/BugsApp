import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Attendance() {
  const [record, setRecord] = useState(null);
  const token = localStorage.getItem("token");

  const fetchToday = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/attendance/today", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecord(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePunchIn = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/attendance/punchin", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecord(res.data);
    } catch (err) { console.error(err); }
  };

  const handlePunchOut = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/attendance/punchout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecord(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchToday(); }, []);

  return (
    <div>
      <h3>Attendance</h3>
      <p>Punch In: {record?.punchIn ? new Date(record.punchIn).toLocaleTimeString() : "-"}</p>
      <p>Punch Out: {record?.punchOut ? new Date(record.punchOut).toLocaleTimeString() : "-"}</p>
      {!record?.punchIn ? (
        <button onClick={handlePunchIn}>Punch In</button>
      ) : !record?.punchOut ? (
        <button onClick={handlePunchOut}>Punch Out</button>
      ) : (
        <p>Attendance completed for today ✅</p>
      )}
    </div>
  );
}
