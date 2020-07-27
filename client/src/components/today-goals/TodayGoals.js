import React from "react"
import { minuteToHours, minuteToHoursShort } from "../../helpers/dates"
// --------------------------------------------------------------

// components ----------------
import TodaySubject from "../../components/today-subject/TodaySubject"

function TodayGoals(props) {
  // query data ----------------
  let todaySubject
  let totalDurationTime
  let totalDuration = 0
  let className = "today-goals box-content"

  // check length of bpx output
  if (props.data.length >= 9) {
    className += " today-goals-maxHeight"
  }

  // map entries ----------------
  todaySubject = props.data.map((element, index) => {
    // subject ----------------
    let subject = element.exam.subject

    // duration for 1 exam ----------------
    let duration = element.durationLeftToday
    let durationTime = minuteToHours(element.durationLeftToday)

    // duration for all exams total
    totalDuration += duration
    totalDurationTime = minuteToHoursShort(totalDuration)

    // return ----------------
    return (
      <TodaySubject
        key={index}
        subject={subject}
        durationTime={durationTime}
        onClick={(e) => {
          e.preventDefault()
          props.activeElementIndexChange(index)
        }}
        className={props.activeIndex === index ? "active-subject" : undefined}
      ></TodaySubject>
    )
  })

  // alert no time left ----------------
  let noTimeMessage
  // noTime = todaysChunk.notEnoughTime
  if (totalDuration > 1440) {
    noTimeMessage = "Study faster, today's duration is more than 24h!"
  }

  // return ----------------
  return (
    <div className={className}>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="today-goals__container">
              <div className="today-goals__container__header">
                <h3 className="today-goals__container__header__heading">
                  Today's Goals
                </h3>
                <p className="today-goals__container__header__time">
                  {totalDurationTime}
                </p>
              </div>
              <div className="today-goals__container__warning">
                <p className="today-goals__container__warning__text--warning">
                  {noTimeMessage}
                </p>
              </div>
            </div>
            {/* Subjects */}
            {todaySubject}
            {/* ---------------- */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TodayGoals
