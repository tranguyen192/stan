/// <reference types="cypress" />

describe("Cypress", () => {
  it("is working", () => {
    expect(true).to.equal(true)
  })
})

describe("authentication and registration", () => {
  it("register as a user", () => {
    cy.visit("/sign-up")
      .get(".username-input")
      .type("tra")
      .should("have.value", "tra")

      .get(".email-input")
      .type("tra@nguyen.com")
      .should("have.value", "tra@nguyen.com")

      .get(".password-input")
      .type("password123")
      .should("have.value", "password123")

      .get(".retype-password-input")
      .type("password123")
      .should("have.value", "password123")

      .get(".form-submit")
      .submit()
      .wait(1000)
      .getCookie("refresh_token")
      .should("exist")
  })

  it("login as a user", () => {
    cy.visit("/login")
      .get(".email-input")
      .type("tra@nguyen.com")
      .should("have.value", "tra@nguyen.com")

      .get(".password-input")
      .type("password123")
      .should("have.value", "password123")

      .get(".form-submit")
      .submit()
      .wait(1000)
      .getCookie("refresh_token")
      .should("exist")

    cy.visit("/profile")
      .get(".button a")
      .click({ force: true })

      .get(".delete-button")
      .click({ force: true })

      .get(".delete-account-yes")
      .click({ force: true })
  })
})
