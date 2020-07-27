import React from "react"
// --------------------------------------------------------------

const ExamBar = ({ value }) => {
  // return ----------------
  return (
    <div className="exam-bar">
      <div className="exam-bar__filler" style={{ width: `${value}%` }}></div>
    </div>
  )
}

export default ExamBar
