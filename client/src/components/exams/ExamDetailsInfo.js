import React, { lazy } from "react"
import moment from "moment"
// --------------------------------------------------------------

// react-bootstrap ----------------
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Tooltip from "react-bootstrap/Tooltip"

// helpers functions ----------------
import { getNumberOfDays, minuteToHours } from "../../helpers/dates"
import { extractDomain, filteredLinks } from "../../helpers/general"
import { learningIsComplete } from "../../helpers/examCalc"
import {
  calcExamProgress,
  currentRepetition,
  calcProgressbar,
  getCurrentPage,
  pagesLeft,
} from "../../helpers/examCalc"

// sub-components ----------------
const ExamBar = lazy(() => import("../progressbar/ProgressBar"))

const ExamDetailsInfo = ({ examDetails }) => {
  // day calculations ----------------
  const today = new Date()

  const todaysDayUntilDeadline = getNumberOfDays(
    today,
    new Date(examDetails.examDate)
  )

  const nextPage = getCurrentPage(examDetails, currentRepetition(examDetails))

  // return ----------------
  return (
    <div className="exam-details__inner--details">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-4">
            <div className="exam-details__inner--details--left">
              <div className="exam-data">
                <h4>Exam date</h4>
                <p>{moment(examDetails.examDate).format("DD/MM/YYYY")}</p>
              </div>

              <div className="exam-data">
                <h4>Start learning on</h4>
                <p>{moment(examDetails.startDate).format("DD/MM/YYYY")}</p>
              </div>

              <div className="exam-data">
                <div className="exam-data__heading">
                  <h4>Start page</h4>
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                      <Tooltip>
                        The page number from which you start studying
                      </Tooltip>
                    }
                  >
                    <span className="info-circle">i</span>
                  </OverlayTrigger>
                </div>
                <p>{examDetails.startPage}</p>
              </div>

              <div className="exam-data">
                <div className="exam-data__heading">
                  <h4>Last page</h4>
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={<Tooltip>The last page you have to learn</Tooltip>}
                  >
                    <span className="info-circle">i</span>
                  </OverlayTrigger>
                </div>
                <p>{examDetails.lastPage}</p>
              </div>

              <div className="exam-data">
                <div className="exam-data__heading">
                  <h4>Number of pages</h4>
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                      <Tooltip>
                        How many pages you have to learn in total (in each
                        repetition cycle)
                      </Tooltip>
                    }
                  >
                    <span className="info-circle">i</span>
                  </OverlayTrigger>
                </div>
                <p>{examDetails.numberPages}</p>
              </div>

              <div className="exam-data">
                <h4>Time per page</h4>
                <p>{minuteToHours(examDetails.timePerPage)}</p>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="exam-details__inner--details--right">
              <div className="exam-data">
                <h4>Days until deadline</h4>
                {todaysDayUntilDeadline > 1 ? (
                  <p>{todaysDayUntilDeadline} days left</p>
                ) : (
                  <p>{todaysDayUntilDeadline} day left</p>
                )}
              </div>
              <div className="exam-data">
                <h4>Studied</h4>
                <p>{calcExamProgress(examDetails)}% of 100%</p>
              </div>
              <div className="exam-pages">
                <h4>Pages left incl. repetition</h4>
                <div className="exam-pages__bar">
                  <ExamBar value={calcProgressbar(examDetails)} />

                  <div className="exam-pages__bar--status">
                    {pagesLeft(examDetails) > 1 ? (
                      <p>{pagesLeft(examDetails)} pages left</p>
                    ) : (
                      <p>{pagesLeft(examDetails)} page left</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="exam-data">
                <div className="exam-data__heading">
                  <h4>Next page to study</h4>
                </div>
                <div className="exam-data__pagesStudy">
                  {learningIsComplete(examDetails) ? (
                    <p className="nextPage">{nextPage}</p>
                  ) : (
                    <p>{nextPage}</p>
                  )}

                  {learningIsComplete(examDetails) ? (
                    <p className="finished-message">
                      no more pages left to study
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="exam-data">
                <h4>Repeat</h4>
                {examDetails.timesRepeat > 1 ? (
                  <p>{examDetails.timesRepeat} times</p>
                ) : (
                  <p>{examDetails.timesRepeat} time</p>
                )}
              </div>

              <div className="exam-data">
                <h4>Repetition cycle</h4>
                <p>
                  {currentRepetition(examDetails)}/{examDetails.timesRepeat}
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="link">
              <div className="link--headline">
                <h4>Study material links</h4>
              </div>
              {filteredLinks(examDetails.studyMaterialLinks).length > 0 ? (
                <div className="link--buttons">
                  {filteredLinks(examDetails.studyMaterialLinks).map(
                    (value, index) => (
                      <div key={index}>
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="stan-btn-secondary link-button"
                        >
                          {extractDomain(value)}
                        </a>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="empty-link">
                  <p>no links available</p>
                </div>
              )}
            </div>
          </div>
          <div className="col-md-12">
            <div className="exam-details__inner--details--bottom">
              <h4>Notes</h4>

              <div className="notes">
                {!examDetails.notes ? <p>...</p> : <p>{examDetails.notes}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamDetailsInfo
