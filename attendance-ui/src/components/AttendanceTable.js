import React from "react";

function AttendanceTable({ records }) {

  return (

    <table border="1">

      <thead>
        <tr>
          <th>Date</th>
          <th>In Time</th>
          <th>Out Time</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>

        {records.map((record) => (

          <tr key={record.id}>
            <td>{record.date}</td>
            <td>{record.in_time}</td>
            <td>{record.out_time}</td>
            <td>{record.status}</td>
          </tr>

        ))}

      </tbody>

    </table>

  );
}

export default AttendanceTable;