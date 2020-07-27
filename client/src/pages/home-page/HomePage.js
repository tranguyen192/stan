import React, { lazy } from "react"
import { Link } from "react-router-dom"
// --------------------------------------------------------------

// queries ----------------
import { CURRENT_USER } from "../../graphQL/users/queries"

// libraries ----------------

// apolloClient cache ----------------
import { client } from "../../apolloClient"

// components ----------------
const SubHeading = lazy(() => import("../../components/sub-heading/SubHeading"))
const Listing = lazy(() => import("../../components/listing/Listing"))
const Dashboard = lazy(() => import("../dashboard-page/DashboardPage"))
const ParticlesComponent = lazy(() =>
  import("../../components/particles/Particles")
)

const Home = () => {
  // redirects ----------------
  const currentUser = client.readQuery({ query: CURRENT_USER }).currentUser
  if (currentUser !== null) {
    return <Dashboard />
  }

  // return ----------------
  return (
    <div className="home">
      <ParticlesComponent />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-md-10">
            <h2 className="home__heading">
              Organize your <br></br>Study Plan
            </h2>
            <SubHeading className="sub-heading" text="Easy . Fast . Online" />

            <p className="home__text">
              Students like yourself can add and organize their learning
              material for exams with stan. stan supports you in dividing up
              your tasks for each subject. Deadlines, as well as calculated
              daily study chunks are visualised, making it easy for you to keep
              track of your progress and fight procrastination.
            </p>

            <ul className="home__list">
              <Listing
                className="list-style"
                text="increase your learning motivation"
              />
              <Listing
                className="list-style"
                text="decrease your procrastination"
              />
            </ul>

            <div className="home__btn">
              <Link to="/sign-up" className="stan-btn-double">
                Start now
              </Link>
            </div>
          </div>
          <div className="col-md-1"></div>
        </div>
      </div>
    </div>
  )
}

export default Home
