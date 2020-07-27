import React from "react"

// components ----------------
import Input from "../../components/input/Input"

function TestLogin({ onSubmit }) {
  return (
    <div>
      <form
        data-testid="login-form"
        onSubmit={e => {
          e.preventDefault()
          const { email, password } = e.target.elements
          onSubmit({
            email: email.value,
            password: password.value,
          })
        }}
      >
        <label
          data-testid="required-label-email"
          htmlFor="email"
          className="login__form__element__label"
        >
          Email
        </label>

        <input
          data-testid="required-input-email"
          className="login__form__element__input"
          type="email"
          id="email"
          label="email"
          placeholder="lucy@stan.io"
          required
        />

        <label htmlFor="password" className="login__form__element__label">
          Password
        </label>

        <input
          data-testid="required-input-password"
          type="password"
          className="login__form__element__input"
          id="password"
          label="password"
          placeholder=""
          required
        />

        <button
          data-testid="button"
          type="submit"
          className="stan-btn-primary"
          variant="button"
        >
          Submit
        </button>
      </form>
    </div>
  )
}

export default TestLogin
