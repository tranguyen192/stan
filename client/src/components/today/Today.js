import React, { lazy } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import moment from "moment"
import { minuteToHours } from "../../helpers/dates"
// --------------------------------------------------------------

// queries ----------------
import { useMutation } from "@apollo/react-hooks"
import {
  GET_EXAMS_QUERY,
  GET_TODAYS_CHUNKS_AND_PROGRESS,
  GET_CALENDAR_CHUNKS,
} from "../../graphQL/exams/queries"

// mutations ----------------
import { UPDATE_CURRENT_PAGE_MUTATION } from "../../graphQL/exams/mutations"

// react-bootstrap ----------------
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Tooltip from "react-bootstrap/Tooltip"

// helpers ----------------
import { decodeHtml } from "../../helpers/general"

// components ----------------
const Button = lazy(() => import("../../components/button/Button"))
const Label = lazy(() => import("../../components/label/Label"))
const Input = lazy(() => import("../../components/input/Input"))
const Timeline = lazy(() => import("../../components/timeline/Timeline"))

function calcGoalPage(numberPagesToday, chunkStartPage, startPage, lastPage) {
  let goalPage = numberPagesToday + chunkStartPage - 1
  if (goalPage > lastPage) {
    //gone over rep cycle
    //e.g. 5 % 5 = 0, but: 4%5 = 4 + 1 = 5
    let leftover = ((goalPage - 1) % lastPage) + 1
    goalPage = leftover + startPage - 1
  }
  return goalPage
}

function Today(props) {
  // form specific ----------------
  const { register, errors, handleSubmit, reset } = useForm()

  // user click to add custom page number ----------------
  const onSubmit = async (formData) => {
    try {
      const chunk = props.selectedGoal
      const exam = chunk.exam
      const lastPage = exam.numberPages
      let cyclesStudied = parseInt(formData.cycles_studied)
      let newPage =
        parseInt(formData.page_amount_studied) +
        lastPage * (cyclesStudied - 1) +
        1 // plus one to tell backend from which page to study next

      // update page ----------------
      const resp = await updatePage({
        variables: {
          page: newPage,
          id: exam.id,
        },
        refetchQueries: [
          { query: GET_EXAMS_QUERY },
          { query: GET_TODAYS_CHUNKS_AND_PROGRESS },
          { query: GET_CALENDAR_CHUNKS },
        ],
      })

      if (resp && resp.data && resp.data.updateCurrentPage) {
        reset({}) // reset form data
      } else {
        throw new Error(
          "Unable to update study progress, please check your input"
        )
      }
    } catch (err) {
      let element = document.getElementsByClassName("graphql-error")

      if (err.graphQLErrors && err.graphQLErrors[0]) {
        element[0].innerHTML = err.graphQLErrors[0].message
      } else {
        element[0].innerHTML = err.message
      }
    }
  }

  // user click on goal-studied ----------------
  const onSubmitAll = async (e) => {
    e.preventDefault()
    try {
      const resp = await updatePage({
        variables: {
          page:
            props.selectedGoal.numberPagesToday + props.selectedGoal.startPage,
          id: props.selectedGoal.exam.id,
        },
        refetchQueries: [
          { query: GET_EXAMS_QUERY },
          { query: GET_TODAYS_CHUNKS_AND_PROGRESS },
          { query: GET_CALENDAR_CHUNKS },
        ],
      })

      if (resp && resp.data && resp.data.updateCurrentPage) {
      } else {
        throw new Error("Unable to update study progress")
      }
    } catch (err) {
      let element = document.getElementsByClassName("graphql-error")

      if (err.graphQLErrors && err.graphQLErrors[0]) {
        element[0].innerHTML = err.graphQLErrors[0].message
      } else {
        element[0].innerHTML = err.message
      }
    }
  }
  // ------------------------------------------------------------------------------------------------
  // mutation ----------------
  const [updatePage] = useMutation(UPDATE_CURRENT_PAGE_MUTATION)

  // load todaysChunk ----------------
  let todaysChunk = props.selectedGoal

  // subject ----------------
  let subject = todaysChunk.exam.subject

  // deadline ----------------
  let deadline = moment(todaysChunk.exam.examDate).format("DD/MM/YYYY")

  // current page total (total pages + real current page) ----------------
  // ex: total 30, real current: 4, current: 34
  let currentPage = todaysChunk.exam.currentPage

  // last page to study ----------------
  let lastPage = todaysChunk.exam.lastPage

  // start page for today's chunk goal ----------------
  let startPageExam = todaysChunk.exam.startPage
  let startPageChunk = todaysChunk.startPage

  // repetition ----------------
  let repetitionCycles = todaysChunk.exam.timesRepeat
  let repetition = 1 // start at 1
  // calculate real current rep cycle
  repetition =
    Math.floor((currentPage - startPageExam) / todaysChunk.exam.numberPages) + 1
  // --------------------------------

  // real current page to display ----------------
  let realCurrentPage
  if (startPageExam === 1) {
    realCurrentPage = currentPage % lastPage
    // only 1 page to study
  } else if (startPageExam === lastPage) {
    realCurrentPage = currentPage % lastPage
    // consider start page in calculation
  } else {
    realCurrentPage =
      (currentPage % lastPage) +
      startPageExam * repetition -
      startPageExam -
      repetition +
      1
  }
  // to display the last page correctly (edge cases)
  if (realCurrentPage === 0) {
    realCurrentPage = lastPage
  }
  if (realCurrentPage < startPageExam) {
    realCurrentPage = startPageExam
  }
  if (realCurrentPage > lastPage) {
    realCurrentPage = startPageExam
  }
  // final page number displayed in component
  let goalStartPage =
    ((currentPage - startPageExam) % (lastPage - startPageExam + 1)) +
    startPageExam
  // --------------------------------

  // page amount to display ----------------
  let pageAmount = currentPage - startPageChunk
  // --------------------------------

  // duration ----------------
  let duration = todaysChunk.durationLeftToday
  let durationFormatted = minuteToHours(duration)

  // alert no time left ----------------
  let noTimeMessage
  // noTime = todaysChunk.notEnoughTime
  if (duration > 1440) {
    noTimeMessage =
      "Info: You need to study faster to finish all pages until the exam!"
  }
  // --------------------------------

  // days till deadline ----------------
  let daysLeft = todaysChunk.daysLeft
  // total days from start to end date
  let totalDays = todaysChunk.exam.totalNumberDays
  // percentage for bar
  let dayPercentage = 100 - Math.round((daysLeft / totalDays) * 100)
  // --------------------------------

  // repetition goal to display next to goal ----------------
  let repetitionGoal =
    Math.floor(
      (startPageChunk + todaysChunk.numberPagesToday - startPageExam - 1) /
        todaysChunk.exam.numberPages
    ) + 1

  // end page for today's chunk goal ----------------
  // let numberPagesToday = todaysChunk.numberPagesToday + startPageExam - 1

  let numberPagesToday = calcGoalPage(
    todaysChunk.numberPagesToday,
    todaysChunk.startPage,
    todaysChunk.exam.startPage,
    todaysChunk.exam.lastPage
  )

  // page the chunk starts at ----------------
  //(to display in frontend correctly, regardless of rep cycle)
  let realChunkStartPage =
    ((startPageChunk - startPageExam) % (lastPage - startPageExam + 1)) +
    startPageExam

  // display warning if multiple cycles to study
  if (
    realChunkStartPage + todaysChunk.numberPagesToday - 1 > lastPage &&
    repetitionGoal > repetition &&
    repetition !== repetitionCycles
  ) {
    // show message
    noTimeMessage = "Info: You have to study multiple repetition cycles today"
  }

  // //todo
  // // when numberPagesToday is bigger than lastPage, the user needs to study more than 1 repetition in a day
  // if (numberPagesToday > lastPage) {
  //   // maximum goal is last page
  //   numberPagesToday = lastPage
  // }
  // --------------------------------

  // pages are left in total with repetition cycles ----------------
  let leftPagesTotal
  let leftPagesPercentage
  let currentPageBar

  // pages left
  leftPagesTotal = todaysChunk.numberPagesToday - (currentPage - startPageChunk)

  // percentage for bar
  currentPageBar = todaysChunk.numberPagesToday
  // to start with 0 in bar
  if (currentPageBar === 1 || currentPageBar === startPageExam)
    currentPageBar = 0
  // %-number
  leftPagesPercentage =
    100 - Math.round((leftPagesTotal * 100) / currentPageBar)
  // --------------------------------

  // return ----------------
  return (
    <div className="today box-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="today__container">
              <div className="today__container__header">
                <h3 className="today__container__header__heading">Today</h3>
                <div className="today__container__header__deadline">
                  <p className="today__container__header__deadline__text">
                    deadline
                  </p>
                  <p className="today__container__header__deadline__date">
                    {deadline}
                  </p>
                </div>
              </div>
              <div className="today__container__content">
                <div className="today__container__content__layout">
                  <div className="today__container__content__subject">
                    <p className="today__container__content__label">Subject</p>
                    <p className="today__container__content__text--big">
                      {decodeHtml(subject)}
                    </p>
                  </div>
                  <div className="today__container__content__warning">
                    <p className="today__container__content__text--warning">
                      {noTimeMessage}
                    </p>
                  </div>
                </div>
                <div className="today__container__content__layout">
                  <div className="today__container__content__details">
                    <div className="today__container__content__details__goal">
                      <p className="today__container__content__label">Goal:</p>
                      <p className="today__container__content__text today-goal">
                        page {goalStartPage} to {numberPagesToday} (rep.{" "}
                        {repetitionGoal})
                      </p>
                    </div>
                    <div className="today__container__content__details__duration">
                      <p className="today__container__content__label">
                        Duration:
                      </p>
                      <p className="today__container__content__text today-goal-duration">
                        {durationFormatted}
                      </p>
                    </div>
                  </div>

                  <div className="today__container__content__details">
                    <div className="today__container__content__details__total-pages">
                      <div className="today-info-circle-container">
                        <p className="today__container__content__label">
                          Page amount:
                        </p>
                        <p className="today__container__content__text today-page-amount">
                          {/** example: learn page 51-100, = 50 pages */}
                          {pageAmount} / {todaysChunk.numberPagesToday}
                        </p>
                      </div>
                      <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={
                          <Tooltip>
                            The amount of pages you have to study today
                          </Tooltip>
                        }
                      >
                        <span className="info-circle">i</span>
                      </OverlayTrigger>
                    </div>
                    <div className="today__container__content__details__total-pages">
                      <div className="today-info-circle-container">
                        <p className="today__container__content__label">
                          Total page nos.:
                        </p>
                        <p className="today__container__content__text today-page-nos">
                          {startPageExam} - {lastPage}
                        </p>
                      </div>
                      <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={
                          <Tooltip>
                            The start and last page in your study materials
                          </Tooltip>
                        }
                      >
                        <span className="info-circle">i</span>
                      </OverlayTrigger>
                    </div>
                    <div className="today__container__content__details__repetition">
                      <p className="today__container__content__label">
                        Repetition cycle:
                      </p>
                      <p className="today__container__content__text today-rep-cycles">
                        {repetition} / {repetitionCycles}
                      </p>
                    </div>
                  </div>
                </div>
                {/* days left */}
                <div className="today__container__days-left">
                  <Timeline
                    heading="Days until deadline"
                    daysLeft={daysLeft}
                    percentage={dayPercentage}
                    styleChoice="bar"
                  ></Timeline>
                </div>
                {/* chunks left */}
                <div className="today__container__chunks-left">
                  <Timeline
                    heading="Pages left to study for today"
                    daysLeft={leftPagesTotal}
                    percentage={leftPagesPercentage}
                    styleChoice="bar"
                  ></Timeline>
                </div>

                {/* buttons */}
                <div className="today__container__buttons">
                  <div className="today__container__buttons__submit">
                    {/* pages done */}
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      id="study-chunk"
                      className="today__container__buttons__submit__form"
                    >
                      <div className="today__container__buttons__submit__form__elements-container">
                        <div className="today__container__buttons__submit__form__elements-container__elements">
                          <Label
                            labelType="page"
                            text="studied up to page:"
                            className="today__container__buttons__submit__form__elements-container__elements__label"
                          ></Label>
                          <Input
                            className="today__container__buttons__submit__form__elements-container__elements__input"
                            type="number"
                            min="0"
                            id="page"
                            label="page_amount_studied"
                            placeholder={realCurrentPage}
                            ref={register({
                              required: true,
                              min: startPageExam,
                              max: lastPage,
                            })}
                          />
                        </div>
                        {errors.page_amount_studied &&
                          errors.page_amount_studied.type === "required" && (
                            <span className="error">
                              Please enter a page number
                            </span>
                          )}
                        {errors.page_amount_studied &&
                          errors.page_amount_studied.type === "max" && (
                            <span className="error">
                              The maximum is your study materials last page:{" "}
                              {lastPage}
                            </span>
                          )}
                        {errors.page_amount_studied &&
                          errors.page_amount_studied.type === "min" && (
                            <span className="error">
                              The minimum page your study materials start page:{" "}
                              {startPageExam}
                            </span>
                          )}
                        <div className="today__container__buttons__submit__form__elements-container__elements">
                          <Label
                            labelType="cycle"
                            text="in repetition cycle:"
                            className="today__container__buttons__submit__form__elements-container__elements__label"
                          ></Label>
                          <Input
                            className="today__container__buttons__submit__form__elements-container__elements__input"
                            type="number"
                            min="0"
                            id="cycle"
                            label="cycles_studied"
                            placeholder={repetition}
                            ref={register({
                              required: true,
                              min: repetition,
                              max: repetitionCycles,
                            })}
                          />
                        </div>
                        {errors.cycles_studied &&
                          errors.cycles_studied.type === "required" && (
                            <span className="error">
                              Please enter a cycle number
                            </span>
                          )}
                        {errors.cycles_studied &&
                          errors.cycles_studied.type === "max" && (
                            <span className="error">
                              The maximum is your last cycle: {repetitionCycles}
                            </span>
                          )}
                        {errors.cycles_studied &&
                          errors.cycles_studied.type === "min" && (
                            <span className="error">
                              The minimum is your current cycle: {repetition}
                            </span>
                          )}
                      </div>

                      <Button
                        className="today__container__buttons__submit__form__btn stan-btn-secondary"
                        variant="button"
                        text="save"
                        type="submit"
                      />
                    </form>
                  </div>
                  <div className="today__container__buttons__submit-all">
                    {/* open notes or link */}
                    <Link
                      to={`/exams/${todaysChunk.exam.subject
                        .toLowerCase()
                        .replace(/ /g, "-")}?id=${todaysChunk.exam.id}`}
                      className="today__container__buttons__open"
                    >
                      open notes
                    </Link>

                    <form
                      onSubmit={onSubmitAll}
                      id="study-chunk-all"
                      className="today__container__buttons__submit-all__form-all"
                    >
                      {/* all done */}
                      <div className="today__container__buttons__submit-all__all-done">
                        <Button
                          className="today__container__buttons__submit-all__all-done__btn stan-btn-primary"
                          variant="button"
                          text="goal studied"
                          type="submit"
                        />
                      </div>
                    </form>
                  </div>
                </div>
                <div>
                  <p className="error graphql-error"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Today
