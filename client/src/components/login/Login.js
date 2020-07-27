import React, { useState, lazy } from "react"
import { setAccessToken } from "../../accessToken"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { GoogleLogin } from "react-google-login"
// --------------------------------------------------------------

// mutation ----------------
import { useMutation } from "@apollo/react-hooks"
import {
  LOGIN_MUTATION,
  GOOGLE_LOGIN_MUTATION,
} from "../../graphQL/users/mutations"

// components ----------------
const Input = lazy(() => import("../../components/input/Input"))
const Label = lazy(() => import("../../components/label/Label"))
const Button = lazy(() => import("../../components/button/Button"))
const ForgottenPassword = lazy(() =>
  import("../../components/forgotten-password/ForgottenPassword")
)

const Login = () => {
  // local-storage popup event ----------------
  window.localStorage.setItem("popup-event", false)

  // google login ----------------
  const successGoogle = async response => {
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
      let element = document.getElementsByClassName("graphql-login-error")

      if (err.message === undefined || err.message === null) {
        element[0].innerHTML = "The google login failed."
      } else {
        element[0].innerHTML = err.message
      }
    }
  }

  const failureGoogle = response => {
    let failureGoogleResponse = JSON.stringify(response.Qt.Ad)
    let element = document.getElementsByClassName("graphql-login-error")
    element[0].innerHTML = failureGoogleResponse
  }

  // mutation ----------------
  const [googleLogin] = useMutation(GOOGLE_LOGIN_MUTATION)
  const [login] = useMutation(LOGIN_MUTATION)

  // state ----------------
  const [openForgottenPassword, setForgottenPassword] = useState(false)

  // form specific ----------------
  const { register, errors, handleSubmit } = useForm()
  const onSubmit = async formData => {
    await handleLogin({ formData, login })
  }

  const handleForgottenPassword = () => {
    setForgottenPassword(pw => !pw)
  }

  if (openForgottenPassword) return <ForgottenPassword />

  // return ----------------
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="login__form form-submit box-content"
    >
      <div className="row">
        <div className="error-handling-form">
          <p className="error graphql-login-error"></p>
        </div>
        <div className="col-md-12 login__form__inner">
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

            {errors.email && errors.email.type === "required" && (
              <span className="error">This field is required</span>
            )}
            {errors.email && errors.email.type === "minLength" && (
              <span className="error">Minimum 1 character required</span>
            )}
            {errors.email && errors.email.type === "maxLength" && (
              <span className="error">Maximum 50 characters allowed</span>
            )}
            {errors.email && errors.email.type === "pattern" && (
              <span className="error">This is no valid e-mail address</span>
            )}
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
            {errors.password && errors.password.type === "required" && (
              <span className="error">This field is required</span>
            )}
            {errors.password && errors.password.type === "minLength" && (
              <span className="error">Minimum 8 characters required</span>
            )}
            {errors.password && errors.password.type === "maxLength" && (
              <span className="error">Maximum 30 characters allowed</span>
            )}
            {errors.password && errors.password.type === "pattern" && (
              <span className="error">
                The password needs to be between 8 and 30 characters long
              </span>
            )}
          </div>

          <div className="login__form__buttons">
            <div className="login__form__buttons__button-right">
              <GoogleLogin
                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                buttonText="Login"
                render={renderProps => (
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
                className="stan-btn-primary"
                variant="button"
                text="Login"
              />
            </div>
          </div>

          <div className="login__form__bottom">
            <div className="login__form__bottom--redirect-signup">
              <p className="login__form__bottom--redirect-signup__text">
                not registered?
              </p>{" "}
              <Link to="/sign-up">sign up</Link>
            </div>

            <div className="login__form__bottom--line">
              <span className="line"></span>
            </div>

            <div className="login__form__bottom--forgotten-password">
              <button
                type="button"
                variant="button"
                onClick={handleForgottenPassword}
              >
                forgotten password?
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default Login

async function handleLogin({ formData, login }) {
  try {
    const resp = await login({
      variables: {
        email: formData.email,
        password: formData.password,
      },
    })
    if (resp && resp.data && resp.data.login) {
      setAccessToken(resp.data.login)
    } else {
      throw new Error("The login failed")
    }

    // redirect ----------------
    localStorage.setItem("login-event", Date.now())
    window.location.reload()
  } catch (err) {
    // error handling ----------------
    let element = document.getElementsByClassName("graphql-login-error")

    if (err.graphQLErrors && err.graphQLErrors[0]) {
      element[0].innerHTML = err.graphQLErrors[0].message
    } else {
      element[0].innerHTML = err.message
    }
  }
}
