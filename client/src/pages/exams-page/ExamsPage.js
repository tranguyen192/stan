import React, { useState, lazy } from "react"
import { useQuery } from "@apollo/react-hooks"
import { Redirect, Link, useRouteMatch } from "react-router-dom"
// --------------------------------------------------------------

// queries ----------------
import { CURRENT_USER } from "../../graphQL/users/queries"
import { GET_EXAMS_QUERY } from "../../graphQL/exams/queries"

// apolloClient cache ----------------
import { client } from "../../apolloClient"

// helpers ----------------
import { decodeHtml } from "../../helpers/general"
import { calcExamProgress } from "../../helpers/examCalc"

// components ----------------
const Exam = lazy(() => import("../../components/exams/Exam"))
const QueryError = lazy(() => import("../../components/error/Error"))
const Loading = lazy(() => import("../../components/loading/Loading"))

const Exams = () => {
  // router ----------------
  let { url } = useRouteMatch()

  // state & queries ----------------
  const [isArchiveOpen, setArchiveExams] = useState(false)
  const { loading, error } = useQuery(GET_EXAMS_QUERY)

  // variables ----------------
  let currentExams, archiveExams
  let currentExamsList = []
  let archiveExamsList = []

  // redirects ----------------
  const currentUser = client.readQuery({ query: CURRENT_USER }).currentUser
  if (currentUser === null) {
    return <Redirect to="/login" />
  }

  // loading & error handling ----------------
  if (loading) return <Loading />
  if (error) return <QueryError errorMessage={error.message} />

  // run query in cache ----------------
  const data = client.readQuery({ query: GET_EXAMS_QUERY }).exams

  // filter all exams ----------------
  archiveExamsList = data.filter((exam) => exam.completed)
  currentExamsList = data.filter((exam) => !exam.completed)

  // functions ----------------
  currentExams = currentExamsList.map(function (exam) {
    return (
      <div key={exam.id}>
        <Link
          to={`${url}/${exam.subject.toLowerCase().replace(/ /g, "-")}?id=${
            exam.id
          }`}
        >
          <Exam
            subject={decodeHtml(exam.subject)}
            currentStatus={calcExamProgress(exam)}
          />
        </Link>
      </div>
    )
  })

  archiveExams = archiveExamsList.map(function (exam) {
    return (
      <div key={exam.id}>
        <Link
          to={`${url}/${exam.subject.toLowerCase().replace(/ /g, "-")}?id=${
            exam.id
          }`}
        >
          <Exam
            subject={decodeHtml(exam.subject)}
            currentStatus={calcExamProgress(exam)}
          />
        </Link>
      </div>
    )
  })

  const handleArchiveClick = () => {
    setArchiveExams(!isArchiveOpen)
  }

  // return ----------------
  return (
    <div className="exams">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-md-10">
            <div className="exams__headline">
              <h2>Exams</h2>
            </div>
          </div>
          <div className="col-md-1"></div>

          <div className="col-md-1"></div>
          <div className="col-md-10">
            {currentExamsList.length === 0 ? (
              <div className="exams__empty">
                <div className="col-md-6">
                  <div className="exams__empty__content box-content">
                    <div className="exams__empty__content--headline">
                      <h3>No open exams</h3>
                    </div>

                    <div className="exams__empty__content--text">
                      <p>
                        Are you sure there are no exams you need to study for?
                      </p>
                    </div>

                    <div className="exams__empty__content--btn">
                      <Link to="/add-new" className="stan-btn-primary">
                        Add exam
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-md-6"></div>
              </div>
            ) : (
              <div className="exams__currentExams">{currentExams}</div>
            )}

            <div className="exams__archiveExamsToggle">
              <button
                variant="button"
                onClick={handleArchiveClick}
                className="exams__archiveExamsToggle--button"
              >
                <h2 className="exams__past-exams-heading">Past exams</h2>
                <i className={isArchiveOpen ? "arrow down" : "arrow right"}></i>
              </button>
            </div>

            <div className={isArchiveOpen ? "fadeIn" : "fadeOut"}>
              {archiveExamsList.length === 0 ? (
                <div className="exams__empty">
                  <div className="container-fluid">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="exams__empty--pastExams box-content">
                          <p>no past exams</p>
                        </div>
                      </div>
                      <div className="col-md-8"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="exams__archiveExams">{archiveExams}</div>
              )}
            </div>
          </div>
          <div className="col-md-1"></div>
        </div>
      </div>
    </div>
  )
}

export default Exams
