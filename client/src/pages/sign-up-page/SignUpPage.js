import React, { lazy } from "react"
import { Redirect } from "react-router-dom"
// --------------------------------------------------------------

// queries ----------------
import { CURRENT_USER } from "../../graphQL/users/queries"

// apolloClient cache ----------------
import { client } from "../../apolloClient"

// components ----------------
const SignUpForm = lazy(() => import("../../components/signup/SignUp"))

const SignUpPage = () => {
  // redirects ----------------
  const currentUser = client.readQuery({ query: CURRENT_USER }).currentUser
  if (currentUser !== null) {
    return <Redirect to="/" />
  }

  // return ----------------
  return (
    <div className="login">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-md-10 login__headline">
            <h2 className="login__headline__heading">Sign Up</h2>
            <p className="login__headline__sub-heading">
              You can sign up via Google or with your E-Mail address
            </p>
          </div>
          <div className="col-md-1"></div>

          <div className="col-lg-2"></div>
          <div className="col-lg-8 login__form-container">
            <SignUpForm />
          </div>
          <div className="col-lg-2"></div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
