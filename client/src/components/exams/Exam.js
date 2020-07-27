import React from "react"
// --------------------------------------------------------------

const Exam = ({ subject, currentStatus }) => {
  // return ----------------
  return (
    <div className="exam">
      <div className="exam__subject box-content">
        <div className="exam__subject--headline">
          <h3>{subject}</h3>
        </div>
        <div className="exam__subject--current-status">
          <p>completed {currentStatus}%</p>
        </div>
      </div>
    </div>
  )
}

export default Exam
