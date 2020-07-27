import React, { useState, lazy } from "react"
import { setAccessToken } from "../../accessToken"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
// --------------------------------------------------------------

// mutation & queries ----------------
import { useMutation } from "@apollo/react-hooks"
import {
  SIGNUP_MUTATION,
  GOOGLE_LOGIN_MUTATION,
} from "../../graphQL/users/mutations"

// google login ----------------
import { GoogleLogin } from "react-google-login"

// components ----------------
const Input = lazy(() => import("../../components/input/Input"))
const Label = lazy(() => import("../../components/label/Label"))
const Button = lazy(() => import("../../components/button/Button"))

const SignUp = () => {
  // form ----------------
  const { register, errors, handleSubmit } = useForm()

  // state ----------------
  const [notification, setNotification] = useState(false)

  // mutation ----------------
  const [signup] = useMutation(SIGNUP_MUTATION)
  const [googleLogin] = useMutation(GOOGLE_LOGIN_MUTATION)

  // google signup ----------------
  const successGoogle = async (response) => {
    try {
      const resp = await googleLogin({
        variables: {
          idToken: response.tokenId,
        },
      })

      if (resp && resp.data && resp.data.googleLogin)
        setAccessToken(resp.data.googleLogin)
      else throw new Error("The google login failed")

      window.location.reload()
    } catch (err) {
      let element = document.getElementsByClassName("graphql-sign-up-error")

      if (err.message === undefined || err.message === null) {
        element[0].innerHTML = "The google login failed."
      } else {
        element[0].innerHTML = err.message
      }
    }
  }
  const failureGoogle = (response) => {
    let failureGoogleResponse = JSON.stringify(response.Qt.Ad)
    let element = document.getElementsByClassName("graphql-sign-up-error")
    element[0].innerHTML = failureGoogleResponse
  }

  // form specific ----------------
  const onSubmit = async (formData) => {
    if (formData.password === formData.retype_password) {
      document.getElementById("signup-error").style.display = "none"

      handleSignup({ formData, signup, notification })
    } else {
      document.getElementById("signup-error").style.display = "block"
    }
  }

  const handleNotification = () => {
    setNotification((notification) => !notification)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="login__form form-submit box-content"
    >
      <div className="row">
        <div className="col-md-12 login__form__inner">
          <div id="signup-error">
            <div className="error sign-up-error">
              <p>Please make sure your passwords match.</p>
            </div>
          </div>

          <div className="error-handling-form">
            <p className="error graphql-sign-up-error"></p>
          </div>

          <div className="login__form__element">
            <Label
              labelType="username"
              text="Username"
              className="login__form__element__label input-required"
            ></Label>
            <Input
              className="login__form__element__input username-input"
              type="text"
              id="username"
              label="username"
              placeholder="Lucy"
              required
              ref={register({
                required: true,
                minLength: 1,
                maxLength: 30,
                pattern: /^.{1,30}$/,
              })}
            />
            {errors.username && errors.username.type === "required" ? (
              <span className="error">This field is required</span>
            ) : null}
            {errors.username && errors.username.type === "minLength" ? (
              <span className="error"> Minimum 8 character required</span>
            ) : null}
            {errors.username && errors.username.type === "maxLength" ? (
              <span className="error"> Maximum 30 characters allowed</span>
            ) : null}
            {errors.username && errors.username.type === "pattern" ? (
              <span className="error">
                The username needs to be between 1 and 30 characters long
              </span>
            ) : null}
          </div>

          <div className="login__form__element">
            <Label
              labelType="email"
              text="E-Mail"
              className="login__form__element__label input-required"
            ></Label>
            <Input
              className="login__form__element__input email-input"
              type="email"
              id="email"
              label="email"
              placeholder="lucy@stan.io"
              required
              ref={register({
                required: true,
                minLength: 1,
                maxLength: 50,
                pattern: /^([\w_\-."+!#$%&'*/=?^`{|}~ ]{1,64})@([\w_\-.]+)\.([a-z]+)$/,
              })}
            />
            {errors.email && errors.email.type === "required" ? (
              <span className="error">This field is required</span>
            ) : null}
            {errors.email && errors.email.type === "minLength" ? (
              <span className="error"> Minimum 1 character required</span>
            ) : null}
            {errors.email && errors.email.type === "maxLength" ? (
              <span className="error"> Maximum 30 characters allowed</span>
            ) : null}
            {errors.email && errors.email.type === "pattern" ? (
              <span className="error">This is no valid e-mail address</span>
            ) : null}
          </div>

          <div className="login__form__element">
            <Label
              labelType="password"
              text="Password"
              className="login__form__element__label input-required"
            ></Label>
            <Input
              className="login__form__element__input password-input"
              type="password"
              id="password"
              label="password"
              required
              ref={register({
                required: true,
                minLength: 8,
                maxLength: 30,
                pattern: /^.{8,30}$/,
              })}
            />
            {errors.password && errors.password.type === "required" ? (
              <span className="error">This field is required</span>
            ) : null}
            {errors.password && errors.password.type === "minLength" ? (
              <span className="error"> Minimum 8 characters required</span>
            ) : null}
            {errors.password && errors.password.type === "maxLength" ? (
              <span className="error"> Maximum 30 characters allowed</span>
            ) : null}
            {errors.password && errors.password.type === "pattern" ? (
              <span className="error">
                The password needs to be between 8 and 30 characters long
              </span>
            ) : null}
          </div>

          <div className="login__form__element">
            <Label
              labelType="retype_password"
              text="Retype password"
              className="login__form__element__label input-required"
            ></Label>
            <Input
              className="login__form__element__input retype-password-input"
              type="password"
              id="retype_password"
              label="retype_password"
              required
              ref={register({
                required: true,
                minLength: 8,
                maxLength: 30,
                pattern: /^.{8,30}$/,
              })}
            />
            {errors.retype_password &&
            errors.retype_password.type === "required" ? (
              <span className="error">This field is required</span>
            ) : null}
            {errors.retype_password &&
            errors.retype_password.type === "minLength" ? (
              <span className="error"> Minimum 8 characters required</span>
            ) : null}
            {errors.retype_password &&
            errors.retype_password.type === "maxLength" ? (
              <span className="error"> Maximum 30 characters allowed</span>
            ) : null}
            {errors.retype_password &&
            errors.retype_password.type === "pattern" ? (
              <span className="error">
                The password needs to be between 8 and 30 characters long
              </span>
            ) : null}
          </div>

          <div className="login__form__notifications">
            <label htmlFor="notification" className="container">
              <input
                type="checkbox"
                id="notification"
                name="notification"
                value="notification"
                className="notification-checkbox"
                onChange={handleNotification}
              />
              <span className="checkmark"></span>
              Allow email notifications when exam date is close (can be changed
              at any time in the user profile)
            </label>
          </div>

          <div className="login__form__buttons">
            <div className="login__form__buttons__button-right">
              <GoogleLogin
                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                buttonText="Login"
                render={(renderProps) => (
                  <button
                    type="button"
                    onClick={renderProps.onClick}
                    disabled={renderProps.disabled}
                    className="stan-btn-secondary"
                  >
                    Google Login
                  </button>
                )}
                onSuccess={successGoogle}
                onFailure={failureGoogle}
                cookiePolicy={"single_host_origin"}
              />
            </div>
            <div className="login__form__buttons__button-left">
              <Button
                type="submit"
                variant="button"
                text="Sign up"
                className="stan-btn-primary submit-button"
              />
            </div>
          </div>

          <div className="login__form__bottom">
            <div className="login__form__bottom--redirect-signup">
              <p className="login__form__redirect-signup__text">
                already have an account?
              </p>
              <Link to="/login" className="login__form__redirect-signup__link">
                login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default SignUp

async function handleSignup({ formData, signup, notification }) {
  try {
    const resp = await signup({
      variables: {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        mascot: 0,
        allowEmailNotifications: notification,
      },
    })

    if (resp && resp.data && resp.data.signup) {
      setAccessToken(resp.data.signup)
      console.log("saved access token after signup")
    } else {
      throw new Error("The sign up failed")
    }

    // redirect ----------------
    window.localStorage.setItem("mascot-event", true)
    window.location.reload()
  } catch (err) {
    let element = document.getElementsByClassName("graphql-sign-up-error")

    if (err.graphQLErrors && err.graphQLErrors[0]) {
      element[0].innerHTML = err.graphQLErrors[0].message
    } else {
      element[0].innerHTML = err.message
    }
  }
}
