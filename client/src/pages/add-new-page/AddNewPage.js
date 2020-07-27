import React, { lazy } from "react"
import { CURRENT_USER } from "../../graphQL/users/queries"
import { Redirect } from "react-router-dom"
// --------------------------------------------------------------

// apolloClient cache ----------------
import { client } from "../../apolloClient"

// components ----------------
const AddNew = lazy(() => import("../../components/add-new/AddNew"))

const AddNewPage = () => {
  // redirects ----------------
  const currentUser = client.readQuery({ query: CURRENT_USER }).currentUser
  if (currentUser === null) {
    return <Redirect to="/login" />
  }

  // return ----------------
  return (
    <div className="add-new-page">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-md-10">
            <h2 className="add-new-page__heading">New exam</h2>
            <p className="add-new-page__sub-heading sub-heading">
              enter all details about the exam
            </p>
          </div>
          <div className="col-md-1"></div>

          <div className="col-md-1"></div>
          <div className="col-md-10">
            <AddNew />
          </div>
          <div className="col-md-1"></div>
        </div>
      </div>
    </div>
  )
}

export default AddNewPage
