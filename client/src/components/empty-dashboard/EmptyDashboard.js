import React, { lazy } from "react"
import { useQuery } from "@apollo/react-hooks"
import { Link } from "react-router-dom"
import moment from "moment"
// --------------------------------------------------------------

// queries ----------------
import { GET_EXAMS_QUERY } from "../../graphQL/exams/queries"

// apolloClient cache ----------------
import { client } from "../../apolloClient"

// components ----------------
const QueryError = lazy(() => import("../../components/error/Error"))
const Loading = lazy(() => import("../../components/loading/Loading"))
const ListingLink = lazy(() => import("../../components/listing/ListingLink"))

const EmptyDashboard = ({ heading, text, showBtn }) => {
  // state & queries ----------------
  const { loading, error } = useQuery(GET_EXAMS_QUERY)

  // loading & error handling ----------------
  if (loading) return <Loading />
  if (error) return <QueryError errorMessage={error.message} />

  // run query in cache ----------------
  const data = client.readQuery({ query: GET_EXAMS_QUERY }).exams

  // query data ----------------
  let dueSoon
  let dueSoonItem

  // check if there is data ----------------
  if (data && data.length > 0) {
    // filter only completed entries ----------------
    let filteredItemsDueSoon = data.filter(function (el) {
      // parse Date ----------------
      let today = moment(new Date()).format("MM/DD/YYYY")
      let formExamDate = moment(el.startDate).format("MM/DD/YYYY")

      return formExamDate > today
    })

    // return if items found ----------------
    if (filteredItemsDueSoon.length !== 0) {
      dueSoonItem = filteredItemsDueSoon.map((element, index) => {
        // link to subject in exams
        let subjectLink = `/exams/${element.subject
          .toLowerCase()
          .replace(/ /g, "-")}?id=${element.id}`

        // return listing component
        return (
          <ListingLink
            key={index}
            className="empty-dashboard__upcoming__list-item"
            text={
              " - starting on " +
              moment(element.startDate).format("DD. MMMM YYYY")
            }
            linkText={element.subject}
            link={subjectLink}
          />
        )
      })

      dueSoon = (
        <div className="col-md-12 empty-dashboard__upcoming">
          <h3 className="empty-dashboard__upcoming__heading">
            Upcoming study start dates:
          </h3>
          {dueSoonItem}
        </div>
      )
    }
  }

  // variables ----------------
  let btnAddExam

  if (showBtn === "yes") {
    btnAddExam = (
      <Link
        to="/add-new"
        href="/add-new"
        className="empty-dashboard__btn stan-btn-primary"
      >
        Add exam
      </Link>
    )
  }
  // return ----------------
  return (
    <div className="empty-dashboard box-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h3 className="empty-dashboard__heading">{heading}</h3>
            <p className="empty-dashboard__text">{text}</p>
            {btnAddExam}
          </div>
          {dueSoon}
        </div>
      </div>
    </div>
  )
}

export default EmptyDashboard
