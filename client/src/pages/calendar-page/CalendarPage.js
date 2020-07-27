import React from "react"
import { Redirect } from "react-router-dom"
import ReactDOM from "react-dom"
// --------------------------------------------------------------

// query ----------------
import { useQuery } from "@apollo/react-hooks"
import { GET_CALENDAR_CHUNKS } from "../../graphQL/exams/queries"
import { CURRENT_USER } from "../../graphQL/users/queries"

// libraries ----------------
import moment from "moment"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import listPlugin from "@fullcalendar/list"
import enLocale from "@fullcalendar/core/locales/en-gb"

// react-bootstrap ----------------
import Popover from "react-bootstrap/Popover"
import OverlayTrigger from "react-bootstrap/OverlayTrigger"

// apolloClient cache ----------------
import { client } from "../../apolloClient"

// helpers ----------------
import { minuteToHours } from "../../helpers/dates"
import { extractDomain, decodeHtml } from "../../helpers/general"

// components ----------------
import QueryError from "../../components/error/Error"
import Loading from "../../components/loading/Loading"

// sub-components ----------------
import Button from "../../components/button/Button"

const ExamsCalendar = () => {
  // objects ----------------
  let chunks = []
  let exams = []

  // query ----------------
  const { loading, error } = useQuery(GET_CALENDAR_CHUNKS)

  // redirects ----------------
  const currentUser = client.readQuery({ query: CURRENT_USER }).currentUser
  if (currentUser === null) {
    return <Redirect to="/login" />
  }

  // loading & error handling ----------------
  if (loading) return <Loading />
  if (error) return <QueryError errorMessage={error.message} />

  // run query in cache ----------------
  const data = client.readQuery({ query: GET_CALENDAR_CHUNKS }).calendarChunks
  chunks = data.calendarChunks
  exams = data.calendarExams

  // return ----------------
  return (
    <div className="exams-calendar">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-1"></div>
          <div className="col-lg-10">
            <div className="exams-calendar__inner">
              <FullCalendar
                id="calendar"
                className="calendar-table"
                aspectRatio="1.2"
                height="auto"
                plugins={[dayGridPlugin, listPlugin]}
                defaultView="listWeek"
                eventLimit={true}
                editable={true}
                eventOverlap={false}
                navLinks={true}
                locale={enLocale}
                eventSources={[chunks, exams]}
                eventOrder={"duration"}
                columnHeaderFormat={{ weekday: "long" }}
                noEventsMessage="You've earned a break by now."
                views={{
                  listWeek: {
                    buttonText: "week",
                  },
                }}
                header={{
                  left: "title",
                  right: "dayGridMonth, listWeek, prev, today, next",
                }}
                eventRender={info => {
                  const examDetails = info.event.extendedProps

                  // background color for list-view ----------------
                  info.el.style.backgroundColor = info.event.backgroundColor
                  info.el.style.color = info.event.textColor

                  let popover
                  if (examDetails.__typename === "CalendarChunkDetails") {
                    popover = (
                      <Popover id="popover-basic">
                        {examDetails.__typename === "CalendarChunkDetails" ? (
                          <Popover.Title as="h4" className="popover-title">
                            {decodeHtml(info.event.title)}

                            <Button
                              variant="button"
                              onClick={() => document.body.click()}
                              className="exam-details__headline--back-btn close-calendar-popup"
                              hide="go back"
                            />
                          </Popover.Title>
                        ) : null}

                        <Popover.Content>
                          <div className="exam-date">
                            <h5>Exam date:</h5>
                            <p>
                              {moment(examDetails.examDate).format(
                                "DD/MM/YYYY"
                              )}
                            </p>
                          </div>
                          <div className="current-page">
                            <h5>Current page: </h5>
                            <p>{examDetails.currentPage}</p>
                          </div>
                          <div className="total-pages-left">
                            <h5>Total pages left: </h5>
                            <p>{examDetails.numberPagesLeftTotal}</p>
                          </div>
                          <div className="pages-per-day">
                            <h5>Pages per day to learn: ca. </h5>
                            <p>{examDetails.numberPagesPerDay}</p>
                          </div>
                          <div className="duration-per-day">
                            <h5>Duration per day: ca. </h5>
                            <p>{minuteToHours(examDetails.durationPerDay)}</p>
                          </div>
                          <div className="duration-total">
                            <h5>Duration total: </h5>
                            <p>{minuteToHours(examDetails.durationTotal)}</p>
                          </div>
                          {examDetails.studyMaterialLinks.length > 0 ? (
                            <div className="link">
                              <h5>Study material links:</h5>
                              {examDetails.studyMaterialLinks.map(
                                (value, index) => (
                                  <a key={index} href={value}>
                                    {extractDomain(value)}
                                  </a>
                                )
                              )}
                            </div>
                          ) : null}
                        </Popover.Content>
                      </Popover>
                    )
                  } else {
                    popover = (
                      <Popover id="exam-deadline">Exam deadline</Popover>
                    )
                  }

                  const content = (
                    <OverlayTrigger
                      rootClose
                      placement="top"
                      overlay={popover}
                      trigger="click"
                    >
                      {info.view.type === "dayGridMonth" ? (
                        <div className="fc-content">
                          <span className="fc-content fc-title">
                            {decodeHtml(info.event.title)}
                          </span>
                        </div>
                      ) : (
                        <td>
                          <div className="fc-content">
                            <span className="fc-content fc-title">
                              {decodeHtml(info.event.title)}
                            </span>
                          </div>
                        </td>
                      )}
                    </OverlayTrigger>
                  )
                  ReactDOM.render(content, info.el)
                }}
              />
            </div>
          </div>
          <div className="col-lg-1"></div>
        </div>
      </div>
    </div>
  )
}

export default ExamsCalendar
