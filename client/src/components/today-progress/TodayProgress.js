import React from "react"
// --------------------------------------------------------------

// components ----------------
import Listing from "../listing/Listing"
import Donut from "react-svg-donuts"

// helpers ----------------
import { decodeHtml } from "../../helpers/general"

function TodayProgress(props) {
  // query data ----------------
  let todaySubject
  let goalHeading

  // map entries ----------------
  todaySubject = props.data.map((element, index) => {
    // subject ----------------
    let subject = element.exam.subject

    // return ----------------
    return (
      <Listing
        key={index}
        text={decodeHtml(subject)}
        className={"today-progress__container__content__subjects__list__item"}
      ></Listing>
    )
  })

  if (todaySubject.length > 0) {
    goalHeading = "Completed goals:"
  }

  // Donut ----------------
  let GoalTodayTotal = props.goalsPercentage
  // calculate percentage
  const progress = GoalTodayTotal
  const renderProgress = progress => <strong>{progress}%</strong>

  // return ----------------
  return (
    <div className="today-progress box-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="today-progress__container">
              <h3 className="today-progress__container__heading">
                Today's Progress
              </h3>
              <div className="today-progress__container__content">
                {/* Donut Chart */}
                <div className="today-progress__container__content__chart">
                  <Donut progress={progress} onRender={renderProgress} />
                </div>
                {/* Subjects */}
                <div className="today-progress__container__content__subjects">
                  <h4 className="today-progress__container__content__subjects__heading">
                    {goalHeading}
                  </h4>
                  <ul className="today-progress__container__content__subjects__list">
                    {todaySubject}
                  </ul>
                </div>
                {/* ---------------- */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TodayProgress
