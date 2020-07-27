import React, { useState, lazy } from "react"
import { Redirect } from "react-router-dom"
// --------------------------------------------------------------

// queries ----------------
import { useQuery } from "@apollo/react-hooks"
import { GET_TODAYS_CHUNKS_AND_PROGRESS } from "../../graphQL/exams/queries"
import { CURRENT_USER } from "../../graphQL/users/queries"

// apolloClient cache ----------------
import { client } from "../../apolloClient"

// helpers ----------------
import { decodeHtml } from "../../helpers/general"

// components ----------------
const EmptyDashboard = lazy(() =>
  import("../../components/empty-dashboard/EmptyDashboard")
)
const TodayGoals = lazy(() => import("../../components/today-goals/TodayGoals"))
const Today = lazy(() => import("../../components/today/Today"))
const TodayProgress = lazy(() =>
  import("../../components/today-progress/TodayProgress")
)
const Mascots = lazy(() => import("../../components/mascots/Mascots"))
const QueryError = lazy(() => import("../../components/error/Error"))
const Loading = lazy(() => import("../../components/loading/Loading"))
const CurrentState = lazy(() =>
  import("../../components/current-state/CurrentState")
)

function Dashboard() {
  // state & query ----------------
  const { loading, error } = useQuery(GET_TODAYS_CHUNKS_AND_PROGRESS)
  const [activeElementIndex, setActiveElementIndex] = useState(0)

  // redirects ----------------
  const currentUser = client.readQuery({ query: CURRENT_USER }).currentUser
  if (currentUser === null) {
    return <Redirect to="/login" />
  }

  // mascot trigger ----------------
  const mascot = window.localStorage.getItem("mascot-event")
  if (mascot === "true") {
    return <Mascots />
  }

  // error handling ----------------
  if (loading) return <Loading />
  if (error) return <QueryError errorMessage={error.message} />

  // query data ----------------
  let usersToDos

  // run query in cache ----------------
  const data = client.readQuery({ query: GET_TODAYS_CHUNKS_AND_PROGRESS })

  // check if there is data ----------------
  if (data && data.todaysChunkAndProgress.todaysChunks.length > 0) {
    // count total goals for today
    let goalsTodayPercentage = data.todaysChunkAndProgress.todaysProgress
    // filter only completed entries ----------------
    let filteredItemsDONE = data.todaysChunkAndProgress.todaysChunks.filter(
      function(el) {
        return el.completed === true
      }
    )
    // filter only NOT completed entries ----------------
    let filteredItems = data.todaysChunkAndProgress.todaysChunks.filter(
      function(el) {
        return el.completed === false
      }
    )
    // set index to last element in list (when only 1 is left)
    if (activeElementIndex > filteredItems.length - 1) {
      setActiveElementIndex(filteredItems.length - 1)
      return null
    }

    // exams to do ----------------
    if (filteredItems.length > 0) {
      usersToDos = (
        <div className="container-fluid">
          <div className="row">
            {/* ------ if tasks open ------*/}
            <div className="col-xl-1"></div>
            <div className="col-xl-3">
              {/* Today Goals*/}
              <TodayGoals
                activeElementIndexChange={index => {
                  setActiveElementIndex(index)
                }}
                activeIndex={activeElementIndex}
                data={filteredItems}
              ></TodayGoals>
            </div>
            <div className="col-xl-5 today-component-container">
              {/* Today */}
              <Today selectedGoal={filteredItems[activeElementIndex]}></Today>
            </div>
            <div className="col-xl-3">
              {/* Today Progress */}
              <TodayProgress
                data={filteredItemsDONE}
                goalsPercentage={goalsTodayPercentage}
              ></TodayProgress>
            </div>
          </div>
        </div>
      )
    } else {
      // all done for today ----------------
      usersToDos = (
        <div className="container-fluid">
          <div className="row">
            {/* ------ no tasks ------*/}
            <div className="col-xl-1"></div>
            <div className="col-xl-7">
              <EmptyDashboard
                heading="No open tasks"
                text="You finished studying for today, come back tomorrow"
                showBtn="no"
              ></EmptyDashboard>
            </div>
            <div className="col-xl-3">
              {/* Today Progress */}
              <TodayProgress
                data={filteredItemsDONE}
                goalsPercentage={goalsTodayPercentage}
              ></TodayProgress>
            </div>
            <div className="col-xl-1"></div>
          </div>
        </div>
      )
    }
  } else {
    // no current exams ----------------
    usersToDos = (
      <div className="container-fluid">
        <div className="row">
          {/* ------ no tasks ------*/}
          <div className="col-md-1"></div>
          <div className="col-md-7">
            <EmptyDashboard
              heading="No open tasks"
              text="Are you sure there are no exams you need to study for?"
              showBtn="yes"
            ></EmptyDashboard>
          </div>
          <div className="col-md-4"></div>
        </div>
      </div>
    )
  }

  // return ----------------
  return (
    <div className="dashboard-page">
      <div className="container-fluid">
        <div className="row dashboard-header">
          <div className="col-xl-1"></div>
          <div className="col-xl-7">
            <h2 className="dashboard-page__heading">
              Hello {decodeHtml(currentUser.username)}
            </h2>
            <p className="dashboard-page__current-date">{getCurrentDate()}</p>
          </div>
          {/* Mascot */}
          <div className="col-xl-4">
            <CurrentState
              todaysProgress={data.todaysChunkAndProgress.todaysProgress}
            />
          </div>
        </div>
      </div>
      {/* dashboard content */}
      {usersToDos}
      {/* ---------------- */}
    </div>
  )
}

export default Dashboard

function getCurrentDate() {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]

  let today = new Date()
  let date =
    days[today.getDay()] +
    ", " +
    today.getDate() +
    ". " +
    monthNames[today.getMonth() + 1] +
    " " +
    today.getFullYear()

  return date
}
