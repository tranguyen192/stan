import React, { useEffect, useState, lazy } from "react"
import { useQuery, useMutation } from "@apollo/react-hooks"
import { Redirect, useHistory } from "react-router-dom"
import { useForm } from "react-hook-form"
import moment from "moment"
// --------------------------------------------------------------

// queries ----------------
import {
  GET_EXAM_QUERY,
  GET_EXAMS_QUERY,
  GET_TODAYS_CHUNKS_AND_PROGRESS,
  GET_CALENDAR_CHUNKS,
} from "../../graphQL/exams/queries"
import { CURRENT_USER } from "../../graphQL/users/queries"

// mutation ----------------
import { UPDATE_EXAM_MUTATION } from "../../graphQL/exams/mutations"

// apolloClient cache ----------------
import { client } from "../../apolloClient"

// react-bootstrap & color picker ----------------
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Tooltip from "react-bootstrap/Tooltip"
import { SliderPicker } from "react-color"

// helpers functions ----------------
import { filteredLinks } from "../../helpers/general"
import { currentRepetition } from "../../helpers/examCalc"

// sub-components ----------------
const Label = lazy(() => import("../../components/label/Label"))
const Button = lazy(() => import("../../components/button/Button"))
const QueryError = lazy(() => import("../../components/error/Error"))
const Loading = lazy(() => import("../../components/loading/Loading"))
const DatePicker = lazy(() => import("../../components/datepicker/DatePicker"))

const ExamDetailsEdit = ({ examId }) => {
  let history = useHistory()

  // query ----------------
  const { loading, error } = useQuery(GET_EXAM_QUERY, {
    variables: { id: examId },
  })

  // run query in cache ----------------
  const data = client.readQuery({
    query: GET_EXAM_QUERY,
    variables: { id: examId },
  }).exam

  // state ----------------
  const [oldUrls, setOldUrls] = useState(data.studyMaterialLinks)
  const [newUrls, setNewUrls] = useState([""])
  const oldFilteredLinks = filteredLinks(oldUrls)

  // date picker ----------------
  const [myExamDate, setMyExamDate] = useState(data.examDate)
  const [myStartDate, setMyStartDate] = useState(data.startDate)

  // color picker ----------------
  const [color, setColor] = useState(data.color)

  // parse Date ----------------
  let formExamDate = moment(myExamDate).format("MM/DD/YYYY")
  let formStartDate = moment(myStartDate).format("MM/DD/YYYY")

  let minStartPage
  if (currentRepetition(data) === 1) {
    minStartPage = data.startPage - 1
  } else {
    minStartPage = data.startPage
  }

  // set default values to input fields ----------------
  let defaultValues = {
    subject: data.subject,
    examDate: moment(data.examDate),
    startDate: moment(data.startDate),
    lastPage: data.lastPage,
    timePerPage: data.timePerPage,
    timesRepeat: data.timesRepeat,
    cycle: currentRepetition(data),
    currentPage:
      data.currentPage - data.numberPages * (currentRepetition(data) - 1) - 1,
    startPage: data.startPage,
    notes: data.notes,
  }

  // set default variables in form and make it editable ----------------
  const { register, errors, watch, setValue, handleSubmit } = useForm({
    defaultValues,
  })

  const {
    subject,
    examDate,
    startDate,
    lastPage,
    startPage,
    currentPage,
    cycle,
    timePerPage,
    timesRepeat,
    notes,
  } = watch()

  useEffect(() => {
    register({ exam: "subject" })
    register({ exam: "examDate" })
    register({ exam: "startDate" })
    register({ exam: "lastPage" })
    register({ exam: "startPage" })
    register({ exam: "currentPage" })
    register({ exam: "cycle" })
    register({ exam: "timePerPage" })
    register({ exam: "timesRepeat" })
    register({ exam: "notes" })
  }, [register])

  // mutation ----------------
  const [updateExam] = useMutation(UPDATE_EXAM_MUTATION, {
    refetchQueries: [
      { query: GET_EXAMS_QUERY },
      { query: GET_TODAYS_CHUNKS_AND_PROGRESS },
      { query: GET_CALENDAR_CHUNKS },
    ],
  })

  // redirects ----------------
  const currentUser = client.readQuery({ query: CURRENT_USER }).currentUser
  if (currentUser === null) {
    return <Redirect to="/login" />
  }

  // loading & error handling ----------------
  if (loading) return <Loading />
  if (error) return <QueryError errorMessage={error.message} />

  // functions ----------------
  const handleChange = (exam, e) => {
    e.persist()
    setValue(exam, e.target.value)
  }

  let newLinks = filteredLinks(oldUrls.concat(newUrls))

  const onSubmit = (data) => {
    handleExam({
      examId,
      data,
      updateExam,
      formExamDate,
      formStartDate,
      history,
      color,
      newLinks,
      cycle,
    })
  }

  // input fields for current exam urls ----------------
  const handleOldInputChange = (index, event) => {
    const values = [...oldUrls]
    if (event.target.name === "study-links") {
      values[index] = event.target.value.trim()
    }
    setOldUrls(values)
  }

  const handleRemoveOldFields = (index) => {
    const values = [...oldUrls]
    values.splice(index, 1)
    setOldUrls(values)
  }

  // input fields for new exam urls ----------------
  const handleAddFields = () => {
    const values = [...newUrls]
    values.push([""])
    setNewUrls(values)
  }

  const handleNewInputChange = (index, event) => {
    const values = [...newUrls]
    if (event.target.name === "study-new-links") {
      values[index] = event.target.value
    }
    setNewUrls(values)
  }

  const handleRemoveFields = (index) => {
    const values = [...newUrls]
    values.splice(index, 1)
    setNewUrls(values)
  }

  const handleColor = (color) => {
    setColor(color.hex)
  }

  // return ----------------
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form">
      <div className="row">
        <div className="col-md-6 form__left">
          <div className="form__element">
            <Label
              labelType="subject"
              text="Subject"
              className="form__element__label input-required"
            />
            <input
              className="form__element__input"
              type="text"
              id="subject"
              label="exam_subject"
              value={subject}
              name="subject"
              onChange={handleChange.bind(null, "subject")}
              required
              ref={register({
                required: true,
                minLength: 1,
                maxLength: 50,
              })}
            />
            {errors.subject && errors.subject.type === "required" && (
              <span className="error">This field is required</span>
            )}
            {errors.subject && errors.subject.type === "minLength" && (
              <span className="error"> Minimum 1 character required</span>
            )}
            {errors.subject && errors.subject.type === "maxLength" && (
              <span className="error"> Maximum 50 characters allowed</span>
            )}
          </div>
          <div className="form__container form__container--numbers">
            <div className="form__element">
              <Label
                labelType="exam-date"
                text="Exam date"
                className="form__element__label"
              />
              <DatePicker
                id="exam-date"
                onDaySelected={(selectedDay) => {
                  setMyExamDate(selectedDay)
                }}
                myValue={moment(examDate).format("DD.MM.YYYY")}
                placeholder={moment(examDate).format("DD.MM.YYYY")}
                required={true}
              />
            </div>

            <div className="form__element">
              <div className="info-box-label">
                <Label
                  labelType="study-start-date"
                  text="Start learning on"
                  className="form__element__label"
                />

                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={
                    <Tooltip>The date you want to start studying</Tooltip>
                  }
                >
                  <span className="info-circle">i</span>
                </OverlayTrigger>
              </div>

              <DatePicker
                id="study-start-date"
                onDaySelected={(selectedDay) => {
                  setMyStartDate(selectedDay)
                }}
                myValue={moment(startDate).format("DD.MM.YYYY")}
                disabledAfter={moment(myExamDate).toDate()}
                placeholder={moment(startDate).format("DD.MM.YYYY")}
              />
            </div>
          </div>
          <div className="form__container form__container--numbers">
            <div className="form__element">
              <div className="info-box-label">
                <Label
                  labelType="startPage"
                  text="Start page"
                  className="form__element__label input-required"
                />
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

              <input
                className="form__element__input"
                type="number"
                min="0"
                id="startPage"
                label="exam_start_page"
                name="startPage"
                onChange={handleChange.bind(null, "startPage")}
                value={startPage}
                ref={register({
                  required: true,
                  min: 1,
                  max: 10000,
                })}
              />
              {errors.startPage && errors.startPage.type === "required" && (
                <span className="error">This field is required</span>
              )}
              {errors.startPage && errors.startPage.type === "max" && (
                <span className="error">The maximum is 10.000</span>
              )}
              {errors.startPage && errors.startPage.type === "min" && (
                <span className="error">Only positive numbers are allowed</span>
              )}
            </div>

            <div className="form__element">
              <div className="info-box-label">
                <Label
                  labelType="pageAmount"
                  text="Last page"
                  className="form__element__label input-required"
                />

                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={<Tooltip>The last page you have to learn</Tooltip>}
                >
                  <span className="info-circle">i</span>
                </OverlayTrigger>
              </div>
              <input
                className="form__element__input"
                type="number"
                min="0"
                id="pageAmount"
                label="exam_page_amount"
                name="lastPage"
                onChange={handleChange.bind(null, "lastPage")}
                value={lastPage}
                required
                ref={register({
                  required: true,
                  min: 1,
                  max: 10000,
                })}
              />
              {errors.numberPages && errors.lastPage.type === "required" && (
                <span className="error">This field is required</span>
              )}
              {errors.numberPages && errors.lastPage.type === "max" && (
                <span className="error">The maximum is 10.000</span>
              )}
              {errors.numberPages && errors.lastPage.type === "min" && (
                <span className="error">Only positive numbers are allowed</span>
              )}
            </div>
          </div>

          <div className="form__container form__container--numbers">
            <div className="form__element">
              <div className="info-box-label">
                <Label
                  labelType="currentPage"
                  text="Studied up to page"
                  className="form__element__label input-required"
                ></Label>
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={
                    <Tooltip>
                      You have learnt all the pages up to this page, so you are
                      currently on this page
                    </Tooltip>
                  }
                >
                  <span className="info-circle">i</span>
                </OverlayTrigger>
              </div>

              <input
                className="form__element__input"
                type="number"
                id="currentPage"
                label="exam_current_page"
                name="currentPage"
                onChange={handleChange.bind(null, "currentPage")}
                value={currentPage}
                ref={register({
                  required: true,
                  min: minStartPage,
                  max: lastPage,
                })}
              />
              {errors.currentPage && errors.currentPage.type === "required" && (
                <span className="error">
                  This field is required. If you haven't started studying yet,
                  set it to the value of your start page: {startPage}
                </span>
              )}
              {errors.currentPage && errors.currentPage.type === "min" && (
                <span className="error">
                  The minimum is your start page: {startPage}
                </span>
              )}
              {errors.currentPage && errors.currentPage.type === "max" && (
                <span className="error">
                  The maximum is your last page: {lastPage}
                </span>
              )}
            </div>

            <div className="form__element">
              <div className="info-box-label">
                <Label
                  labelType="pageTime"
                  text="Time per page"
                  className="form__element__label input-required"
                ></Label>
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={
                    <Tooltip>Average time it takes you to learn a page</Tooltip>
                  }
                >
                  <span className="info-circle">i</span>
                </OverlayTrigger>
              </div>
              <input
                className="form__element__input"
                type="number"
                min="0"
                id="pageTime"
                label="exam_page_time"
                name="timePerPage"
                onChange={handleChange.bind(null, "timePerPage")}
                value={timePerPage}
                ref={register({
                  required: true,
                  min: 1,
                  max: 600,
                })}
                required
              />
              {errors.timePerPage && errors.timePerPage.type === "required" && (
                <span className="error">This field is required</span>
              )}
              {errors.timePerPage && errors.timePerPage.type === "max" && (
                <span className="error">
                  {" "}
                  The maximum is 600 minutes (10 hours)
                </span>
              )}
              {errors.timePerPage && errors.timePerPage.type === "min" && (
                <span className="error">Only positive numbers are allowed</span>
              )}
            </div>
          </div>

          <div className="form__container form__container--numbers">
            <div className="form__element">
              <div className="info-box-label">
                <Label
                  labelType="pageRepeat"
                  text="Repeat"
                  className="form__element__label"
                />
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={
                    <Tooltip>
                      How many times you want to study each page
                    </Tooltip>
                  }
                >
                  <span className="info-circle">i</span>
                </OverlayTrigger>
              </div>
              <input
                className="form__element__input"
                type="number"
                id="pageRepeat"
                label="exam_page_repeat"
                name="timesRepeat"
                onChange={handleChange.bind(null, "timesRepeat")}
                value={timesRepeat}
                ref={register({
                  required: false,
                  min: 1,
                  max: 1000,
                })}
              />
            </div>
            {errors.timesRepeat && errors.timesRepeat.type === "max" && (
              <span className="error"> The maximum is 1000 repeats</span>
            )}
            {errors.timesRepeat && errors.timesRepeat.type === "min" && (
              <span className="error">Only positive numbers are allowed</span>
            )}

            <div className="form__element">
              <div className="info-box-label">
                <Label
                  labelType="cycle"
                  text="Repetition cycle"
                  className="form__element__label input-required"
                ></Label>
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={<Tooltip>Your current repetition cycle.</Tooltip>}
                >
                  <span className="info-circle">i</span>
                </OverlayTrigger>
              </div>
              <input
                className="form__element__input"
                type="number"
                min="1"
                id="cycle"
                label="exam_cycle"
                name="cycle"
                onChange={handleChange.bind(null, "cycle")}
                value={cycle}
                ref={register({
                  required: true,
                  min: 1,
                  max: timesRepeat,
                })}
                required
              />
              {errors.cycle && errors.cycle.type === "required" && (
                <span className="error">This field is required</span>
              )}
              {errors.cycle && errors.cycle.type === "max" && (
                <span className="error">
                  {" "}
                  The maximum is {timesRepeat} cycles.
                </span>
              )}
              {errors.cycle && errors.cycle.type === "min" && (
                <span className="error">Only positive numbers are allowed</span>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 form__right">
          <div className="form__right--top">
            <div className="form__element">
              <Label
                labelType="pageNotes"
                text="Notes"
                className="form__element__label"
              />
              <textarea
                className="form__element__input"
                id="pageNotes"
                label="exam_page_notes"
                name="notes"
                onChange={handleChange.bind(null, "notes")}
                value={notes}
                ref={register({
                  required: false,
                  maxLength: 100000000,
                })}
              />
              {errors.notes && errors.notes.type === "maxLength" && (
                <span className="error">
                  The maximal length is 100.000.000 characters
                </span>
              )}
            </div>

            {oldFilteredLinks.length > 0 ? (
              <div className="form__current-study-links">
                <div className="form__element">
                  <div className="info-box-label">
                    <Label
                      labelType="studyLinks"
                      text="Current study links"
                      className="form__element__label"
                    />
                    <OverlayTrigger
                      placement="top"
                      delay={{ show: 250, hide: 400 }}
                      overlay={
                        <Tooltip>
                          Links to your online study documents (e.g. slides,
                          pdfs...)
                        </Tooltip>
                      }
                    >
                      <span className="info-circle">i</span>
                    </OverlayTrigger>
                  </div>
                </div>
                {oldUrls.map((inputField, index) => (
                  <div
                    key={`${index}-oldUrls`}
                    className="form__study-links current-study-links"
                  >
                    <div className="form__element form__study-links--input">
                      <input
                        className="form__element__input"
                        type="url"
                        id="studyLinks"
                        name="studyLinks"
                        value={inputField}
                        label="exam_links_upload"
                        onChange={(event) => handleOldInputChange(index, event)}
                        ref={register({
                          required: false,
                          pattern:
                            "/(ftp|http|https)://(w+:{0,1}w*@)?(S+)(:[0-9]+)?(/|/([w#!:.?+=&%@!-/]))?/",
                        })}
                      />
                    </div>
                    <div className="form__study-links--buttons">
                      <button
                        type="button"
                        onClick={() => handleRemoveOldFields(index)}
                      >
                        -
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="form__current-study-links">
              <div className="form__element">
                <div className="info-box-label">
                  <Label
                    labelType="study-new-links"
                    text="Add new study links (https://...)"
                    className="form__element__label"
                  />
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                      <Tooltip>
                        Links to your online study documents (e.g. slides,
                        pdfs...)
                      </Tooltip>
                    }
                  >
                    <span className="info-circle">i</span>
                  </OverlayTrigger>
                </div>
              </div>
              {newUrls.map((inputField, index) => (
                <div key={`${index}-newUrls`} className="form__study-links">
                  <div className="form__element form__study-links--input">
                    <input
                      className="form__element__input"
                      type="url"
                      id="study-new-links"
                      name="study-new-links"
                      placeholder="https://example.com/math"
                      label="exam_links_upload"
                      onChange={(event) => handleNewInputChange(index, event)}
                      ref={register({
                        required: false,
                        pattern:
                          "/(ftp|http|https)://(w+:{0,1}w*@)?(S+)(:[0-9]+)?(/|/([w#!:.?+=&%@!-/]))?/",
                      })}
                    />
                  </div>

                  <div className="form__study-links--buttons">
                    <button
                      type="button"
                      onClick={() => handleRemoveFields(index)}
                    >
                      -
                    </button>
                    <button
                      className=""
                      type="button"
                      onClick={() => handleAddFields()}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="form__element">
              <div className="form__color-picker">
                <div className="info-box-label">
                  <Label
                    labelType="color"
                    text="Select an exam color"
                    className="form__element__label"
                  />
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                      <Tooltip>
                        Give your exam a unique color to make it stick out in
                        the calendar overview. If no color is selected, stan
                        will generate a random exam color for you.
                      </Tooltip>
                    }
                  >
                    <span className="info-circle">i</span>
                  </OverlayTrigger>
                </div>
                <SliderPicker onChange={handleColor} color={color} />
              </div>

              <div className="form__showColor">
                <h5 className="form__element__label">Selected color</h5>
                <div className="color" style={{ backgroundColor: color }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-12">
          <div className="exam-edit-message">
            <p>
              *Please note, after changing the exam date, start date, number of
              pages, start page or repeat value, the today's learning chunk for
              this exam will be recalculated.
            </p>
          </div>
        </div>

        <div className="col-md-12">
          <div className="form__submit exam-edit-button">
            <Button
              className="form__element__btn stan-btn-primary"
              variant="button"
              text="Save"
            />
          </div>
        </div>

        <div className="col-md-12">
          <p className="error graphql-error"></p>
        </div>

        <div className="col-md-12" id="success-container-edit-exam">
          <p className="success">The changes were successfully saved.</p>
        </div>
      </div>
    </form>
  )
}

export default ExamDetailsEdit

async function handleExam({
  examId,
  data,
  updateExam,
  formExamDate,
  formStartDate,
  history,
  color,
  newLinks,
  cycle,
}) {
  try {
    let numberPages = data.lastPage - data.startPage + 1
    let realCurrentPage =
      parseInt(data.currentPage) + numberPages * (cycle - 1) + 1

    const resp = await updateExam({
      variables: {
        id: examId,
        subject: data.subject.replace(/[^a-zA-Z0-9\s]+/g, ""),
        examDate: formExamDate,
        startDate: formStartDate,
        lastPage: parseInt(data.lastPage),
        timePerPage: parseInt(data.timePerPage),
        timesRepeat: parseInt(data.timesRepeat),
        startPage: parseInt(data.startPage),
        color: color,
        currentPage: realCurrentPage,
        notes: data.notes,
        studyMaterialLinks: newLinks,
        completed: false,
      },
    })

    if (resp && resp.data && resp.data.updateExam) {
      // remove error message ----------------
      let element = document.getElementsByClassName("graphql-error")
      element[0].innerHTML = ""
      // success message ----------------
      let successBox = document.getElementById("success-container-edit-exam")
      successBox.style.display = "block"
    } else {
      throw new Error("Cannot edit current exam.")
    }

    // redirect ----------------
    setTimeout(() => {
      history.push("/exams")
    }, 2000)
  } catch (err) {
    let element = document.getElementsByClassName("graphql-error")

    if (err.graphQLErrors && err.graphQLErrors[0]) {
      element[0].innerHTML = err.graphQLErrors[0].message
    } else {
      element[0].innerHTML = err.message
    }
  }
}
