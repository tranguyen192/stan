import React, { lazy } from "react"
import { Redirect } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useHistory } from "react-router-dom"
// --------------------------------------------------------------

// queries ----------------
import { CURRENT_USER } from "../../graphQL/users/queries"

// mutations ----------------
import { useMutation } from "@apollo/react-hooks"
import { RESET_PASSWORD_MUTATION } from "../../graphQL/users/mutations"

// apolloClient cache ----------------
import { client } from "../../apolloClient"

// components ----------------
const Input = lazy(() => import("../../components/input/Input"))
const Label = lazy(() => import("../../components/label/Label"))
const Button = lazy(() => import("../../components/button/Button"))

const ResetPassword = (props) => {
  const { match } = props
  let history = useHistory()

  // form ----------------
  const { register, errors, handleSubmit } = useForm()

  // get params from url ----------------
  const userId = match.params.id
  const token = match.params.token

  // mutations ----------------
  const [resetPassword] = useMutation(RESET_PASSWORD_MUTATION)

  // redirects ----------------
  const currentUser = client.readQuery({ query: CURRENT_USER }).currentUser
  if (currentUser !== null) {
    return <Redirect to="/" />
  }

  // form specific ----------------
  const onSubmit = async (formData) => {
    if (formData.password === formData.retype_password) {
      document.getElementById("forgotten-password-error").style.display = "none"
      handleResetPassword({ formData, userId, token, resetPassword, history })
    } else {
      document.getElementById("forgotten-password-error").style.display =
        "block"
    }
  }

  return (
    <div className="reset-password">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-md-10 login__headline">
            <h2 className="login__headline__heading">Reset password</h2>
            <p className="login__headline__sub-heading">
              Follow the prompts to reset your password.
            </p>
          </div>
          <div className="col-md-1"></div>

          <div className="col-md-2"></div>
          <div className="col-md-8 login__form-container">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className=" login__form form-submit box-content"
            >
              <div id="success-save-password">
                <p className="success">
                  The new password was successfully saved.
                </p>
              </div>

              <div id="forgotten-password-error">
                <div className="error forgotten-password-error">
                  <p>Please make sure your passwords match.</p>
                </div>
              </div>

              <div className="error-handling-form">
                <p className="error graphql-forgotten-password-error"></p>
              </div>

              <div className="login__form__element">
                <Label
                  labelType="password"
                  text="New password"
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
                  text="Confirm password"
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

              <div className="login__form__buttons">
                <div className="login__form__buttons__button-left">
                  <Button
                    type="submit"
                    variant="button"
                    text="Send password"
                    className="stan-btn-primary submit-button"
                  />
                </div>
              </div>
            </form>
          </div>
          <div className="col-md-2"></div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

async function handleResetPassword({
  formData,
  userId,
  token,
  resetPassword,
  history,
}) {
  try {
    const resp = await resetPassword({
      variables: {
        userId: userId,
        token: token,
        newPassword: formData.password,
      },
    })

    if (resp && resp.data && resp.data.resetPassword) {
      document.getElementById("success-save-password").style.display = "block"
    } else {
      throw new Error("Reset password failed")
    }

    // redirect ----------------
    setTimeout(() => {
      history.push("/login")
    }, 1500)
  } catch (err) {
    let element = document.getElementsByClassName(
      "graphql-forgotten-password-error"
    )

    if (err.graphQLErrors && err.graphQLErrors[0]) {
      element[0].innerHTML = err.graphQLErrors[0].message
    } else {
      element[0].innerHTML = err.message
    }

    setTimeout(() => {
      history.push("/login")
    }, 1500)
  }
}
