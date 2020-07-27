import React from "react"
// --------------------------------------------------------------

// helpers ----------------
import { decodeHtml } from "../../helpers/general"

const TodaySubject = ({ subject, durationTime, id, onClick, className }) => {
  // return ----------------
  return (
    <button className={"today-subject " + className} id={id} onClick={onClick}>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h4 className="today-subject__heading">{decodeHtml(subject)}</h4>
          </div>
          <div className="col-md-12">
            <div className="today-subject__duration">
              <p className="today-subject__duration__text">Duration</p>
              <p className="today-subject__duration__time">{durationTime}</p>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

export default TodaySubject
