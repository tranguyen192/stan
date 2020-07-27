import React, { useState, lazy } from "react"
import { Redirect, useHistory, useLocation } from "react-router-dom"
import { useQuery, useMutation } from "@apollo/react-hooks"
// --------------------------------------------------------------

// queries ----------------
import {
  GET_EXAM_QUERY,
  GET_EXAMS_QUERY,
  GET_CALENDAR_CHUNKS,
  GET_TODAYS_CHUNKS_AND_PROGRESS,
  GET_EXAMS_COUNT,
} from "../../graphQL/exams/queries"
import { CURRENT_USER } from "../../graphQL/users/queries"

// mutations ----------------
import {
  DELETE_EXAM_MUTATION,
  EXAM_COMPLETED_MUTATION,
} from "../../graphQL/exams/mutations"

// apolloClient cache ----------------
import { client } from "../../apolloClient"

// helpers ----------------
import { decodeHtml } from "../../helpers/general"

// components ----------------
const ExamDetailsEdit = lazy(() => import("../exams/ExamDetailsEdit"))
const ExamDetailsInfo = lazy(() => import("../exams/ExamDetailsInfo"))

// sub-components ----------------
const Button = lazy(() => import("../button/Button"))
const QueryError = lazy(() => import("../error/Error"))
const Loading = lazy(() => import("../loading/Loading"))

const getParamId = location => {
  const searchParams = new URLSearchParams(location.search)
  return {
    id: searchParams.get("id") || "0",
  }
}

const ExamDetails = () => {
  // states ----------------
  let [edit, openEdit] = useState(false)
  let [popup, openPopup] = useState(false)

  // routes ----------------
  let history = useHistory()
  const location = useLocation()
  let paramId = getParamId(location)

  // query ----------------
  const { loading, error } = useQuery(GET_EXAM_QUERY, {
    variables: { id: paramId.id },
  })

  // mutation ----------------
  const [deleteExam] = useMutation(DELETE_EXAM_MUTATION, {
    refetchQueries: [
      { query: GET_EXAMS_QUERY },
      { query: GET_CALENDAR_CHUNKS },
      { query: GET_TODAYS_CHUNKS_AND_PROGRESS },
      { query: GET_EXAMS_COUNT },
    ],
  })
  const [examCompleted] = useMutation(EXAM_COMPLETED_MUTATION, {
    refetchQueries: [
      { query: GET_EXAMS_QUERY },
      { query: GET_CALENDAR_CHUNKS },
      { query: GET_TODAYS_CHUNKS_AND_PROGRESS },
      { query: GET_EXAMS_COUNT },
    ],
  })

  // redirects ----------------
  const currentUser = client.readQuery({ query: CURRENT_USER }).currentUser
  if (currentUser === null || paramId.id === "0") {
    return <Redirect to="/login" />
  }

  // loading & error handling ----------------
  if (loading) return <Loading />
  if (error) return <QueryError errorMessage={error.message} />

  // run query in cache ----------------
  const examDetails = client.readQuery({
    query: GET_EXAM_QUERY,
    variables: { id: paramId.id },
  }).exam

  // functions ----------------
  const handleEdit = () => {
    openEdit(edit => !edit)
  }

  const handlePopup = () => {
    openPopup(popup => !popup)
  }

  const handleDeletion = () => {
    examDeletion({ paramId, deleteExam, history })
  }

  const handleCompletion = () => {
    const completed = true
    completeExam({ paramId, examCompleted, history, completed })
  }

  const handleReactivation = () => {
    const completed = false
    completeExam({ paramId, examCompleted, history, completed })
  }

  // return ----------------
  return (
    <div className="exam-details">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-md-10">
            <div className="exam-details__headline">
              <h2>{decodeHtml(examDetails.subject)}</h2>

              <Button
                variant="button"
                onClick={() => {
                  history.goBack()
                }}
                className="exam-details__headline--back-btn"
                hide="go back"
              />
            </div>

            <div className="exam-details__inner box-content">
              <div className="row">
                <div className="col-md-12">
                  <div className="exam-details__inner--bar">
                    <div className="exam-details__inner--bar--headline">
                      <h3>Exam details</h3>
                    </div>

                    <div className="exam-details__inner--bar--right">
                      {!edit && !examDetails.completed ? (
                        <Button
                          variant="button"
                          onClick={handleEdit}
                          className="exam-btn"
                          text="edit"
                        />
                      ) : null}

                      {edit && !examDetails.completed ? (
                        <Button
                          variant="button"
                          onClick={handleEdit}
                          className="exam-btn"
                          text="back"
                        />
                      ) : null}

                      {edit || examDetails.completed ? (
                        <Button
                          variant="button"
                          onClick={handlePopup}
                          className="exam-btn delete-btn"
                          text="delete"
                        />
                      ) : null}

                      <Button
                        variant="button"
                        onClick={() => {
                          history.goBack()
                        }}
                        className="exam-btn close-btn"
                        text="close"
                      />
                    </div>
                  </div>
                </div>

                {edit ? (
                  <div className="col-md-12">
                    <ExamDetailsEdit examId={examDetails.id} />
                  </div>
                ) : null}

                {!edit ? (
                  <div className="col-md-12">
                    <ExamDetailsInfo examDetails={examDetails} />
                  </div>
                ) : null}

                {popup ? (
                  <div className="col-md-12">
                    <div className="exam-details__popup">
                      <div className="exam-details__popup--inner box-content">
                        <div className="exam-details__popup--inner--headline">
                          <h4>Are you sure you want to delete this exam?</h4>
                        </div>

                        <div className="exam-details__popup--inner--buttons">
                          <Button
                            className="stan-btn-secondary"
                            text="Yes"
                            onClick={handleDeletion}
                          />
                          <Button
                            className="stan-btn-primary"
                            text="No"
                            onClick={handlePopup}
                          />
                        </div>

                        <div className="col-md-12">
                          <p className="error graphql-popup-error"></p>
                        </div>

                        <div
                          className="col-md-12"
                          id="success-container-exam-detail"
                        >
                          <p className="success">
                            The exam was successfully deleted.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {!edit && !examDetails.completed ? (
                  <div className="col-md-12">
                    <div className="exam-details__inner--button">
                      <Button
                        className="stan-btn-primary"
                        variant="button"
                        text="Completed"
                        onClick={handleCompletion}
                      />
                    </div>
                  </div>
                ) : null}

                {!edit && examDetails.completed ? (
                  <div className="col-md-12">
                    <div className="exam-details__inner--button">
                      <Button
                        className="stan-btn-primary"
                        variant="button"
                        text="reactivate exam"
                        onClick={handleReactivation}
                      />
                    </div>
                  </div>
                ) : null}

                {!edit ? (
                  <div className="col-md-12">
                    <p className="error graphql-error error-completion"></p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="col-md-1"></div>
        </div>
      </div>
    </div>
  )
}

export default ExamDetails

async function examDeletion({ paramId, deleteExam, history }) {
  try {
    const resp = await deleteExam({
      variables: {
        id: paramId.id,
      },
    })

    if (resp && resp.data && resp.data.deleteExam) {
      document.getElementById("success-container-exam-detail").style.display =
        "block"
    } else {
      throw new Error("The deletion of current exam failed.")
    }

    // redirect ----------------
    setTimeout(() => {
      history.push("/exams")
    }, 1000)
  } catch (err) {
    // error handling ----------------
    let element = document.getElementsByClassName("graphql-popup-error")

    if (err.graphQLErrors && err.graphQLErrors[0]) {
      element[0].innerHTML = err.graphQLErrors[0].message
    } else {
      element[0].innerHTML = err.message
    }
  }
}

async function completeExam({ paramId, examCompleted, history, completed }) {
  try {
    const resp = await examCompleted({
      variables: {
        id: paramId.id,
        completed: completed,
      },
    })

    if (resp && resp.data && resp.data.examCompleted) {
      console.log("The completion of exam was successfully.")
    } else {
      throw new Error("The completion of current exam failed.")
    }

    // redirect ----------------
    history.push("/exams")
  } catch (err) {
    // error handling ----------------
    let element = document.getElementsByClassName(
      "graphql-error error-completion"
    )

    if (err.graphQLErrors && err.graphQLErrors[0]) {
      element[0].innerHTML = err.graphQLErrors[0].message
    } else {
      element[0].innerHTML = err.message
    }
  }
}
