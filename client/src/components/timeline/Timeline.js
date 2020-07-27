import React from "react"
// --------------------------------------------------------------

const Timeline = ({ heading, daysLeft, percentage, styleChoice }) => {
  // return ----------------
  return (
    <dl className={"timeline timeline-" + styleChoice}>
      <dt className="timeline__heading">{heading}</dt>
      <dd className="timeline__bar">
        <div
          className={"timeline__bar__percentage percentage-" + percentage}
        ></div>
        <p className="timeline__bar__text">{daysLeft} left</p>
      </dd>
    </dl>
  )
}

export default Timeline
