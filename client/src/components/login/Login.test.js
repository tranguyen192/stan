import React from "react"
import { render, getByTestId, cleanup } from "@testing-library/react"
import Login from "./TestLogin"
import {
  verifyEmail,
  verifyPassword,
} from "../../../src/helpers/verifyUserInput"

afterEach(cleanup)

it("login user with correct email and password", () => {
  const handleSubmit = jest.fn()
  const { getByLabelText, getByText } = render(
    <Login onSubmit={handleSubmit} />
  )
  expect((getByLabelText(/email/i).value = "tra@nguyen.com")).toBeTruthy()
  expect((getByLabelText(/password/i).value = "password123")).toBeTruthy()
  getByText(/submit/i).click()

  expect(handleSubmit).toHaveBeenCalledWith({
    email: "tra@nguyen.com",
    password: "password123",
  })
})

test("call onSubmit with wrong email and password", () => {
  const handleSubmit = jest.fn()
  const { getByLabelText, getByText } = render(
    <Login onSubmit={handleSubmit} />
  )
  expect(verifyEmail((getByLabelText(/email/i).value = "-@&/.com"))).toBeFalsy()
  expect(
    verifyPassword((getByLabelText(/password/i).value = "987654"))
  ).toBeFalsy()
  getByText(/submit/i).click()
})

test("verifies required input field for email", () => {
  const { getByTestId } = render(<Login />)
  expect(getByTestId("required-input-email")).toBeRequired()
})

test("verifies required input field for password", () => {
  const { getByTestId } = render(<Login />)
  expect(getByTestId("required-input-password")).toBeRequired()
})

test("verifies button disabled", () => {
  const { getByTestId } = render(<Login />)
  expect(getByTestId("button")).not.toBeDisabled()
})

test("verifies input field attribute", () => {
  const { getByTestId } = render(<Login />)
  const button = getByTestId("button")
  expect(button).toHaveAttribute("type", "submit")
})

test("verifies if button has class", () => {
  const { getByTestId } = render(<Login />)
  const button = getByTestId("button")
  expect(button).toHaveClass("stan-btn-primary")
})

test("verifies if email has focus", () => {
  const { getByTestId } = render(<Login />)
  const input = getByTestId("required-input-email")
  input.focus()
  expect(input).toHaveFocus()
})
