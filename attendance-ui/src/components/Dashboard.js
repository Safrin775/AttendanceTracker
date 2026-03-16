import React, { useEffect, useState } from "react";
import axios from "axios";
import AttendanceTable from "./AttendanceTable";

function Dashboard() {

  const [records, setRecords] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/attendance/")
      .then(res => {
        setRecords(res.data);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h2>Attendance Dashboard</h2>
      <AttendanceTable records={records} />
    </div>
  );
}

export default Dashboard;