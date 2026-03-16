import React, { useState } from "react";
import axios from "axios";

function LeaveForm() {

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleSubmit = (e) => {

    e.preventDefault();

    axios.post("http://127.0.0.1:8000/api/leave/", {
      from_date: fromDate,
      to_date: toDate
    })

    .then(res => {
      alert("Leave request submitted");
    })

    .catch(err => console.log(err));

  };

  return (

    <div>

      <h3>Apply Leave</h3>

      <form onSubmit={handleSubmit}>

        <input
          type="date"
          value={fromDate}
          onChange={(e)=>setFromDate(e.target.value)}
          required
        />

        <input
          type="date"
          value={toDate}
          onChange={(e)=>setToDate(e.target.value)}
          required
        />

        <button type="submit">Submit</button>

      </form>

    </div>

  );
}

export default LeaveForm;