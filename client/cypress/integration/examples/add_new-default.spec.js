/// <reference types="cypress" />
import moment from "moment"
// --------------------------------------------------------------

// set date for Date Picker ----------------
let date = new Date()
let futureDate = date.setDate(date.getDate() + 4)
let dateFormatDatePicker = moment(futureDate).format("ddd MMMM DD YYYY")
// --------------------------------------------------------

describe("Cypress", () => {
  it("is working", () => {
    expect(true).to.equal(true)
  })
})

describe("add exam (default) and mark as completed", () => {
  // register ----------------
  it("register as a user", () => {
    cy.visit("/sign-up")
      .get(".username-input")
      .type("dani")
      .should("have.value", "dani")
      .get(".email-input")
      .type("dani@stan.com")
      .should("have.value", "dani@stan.com")
      .get(".password-input")
      .type("12345678")
      .should("have.value", "12345678")
      .get(".retype-password-input")
      .type("12345678")
      .should("have.value", "12345678")
      .get(".form-submit")
      .submit()
      .wait(1000)
      .getCookie("refresh_token")
      .should("exist")
  })
  // --------------------------------------------------------

  it("login & add new exam", () => {
    cy.visit("/login")
      .get(".email-input")
      .type("dani@stan.com")
      .should("have.value", "dani@stan.com")

      .get(".password-input")
      .type("12345678")
      .should("have.value", "12345678")

      .get(".form-submit")
      .submit()
      .wait(1000)
      .getCookie("refresh_token")
    // ---------------------------------------

    cy.visit("/add-new")
      .get(".subject-input")
      .type("Math")
      .should("have.value", "Math")
      .wait(1000)

      .get("#exam-date")
      .click({ waitForAnimations: false })
      .get(".DayPickerInput-OverlayWrapper")
      .click({ force: true })
      .find('[aria-label="' + dateFormatDatePicker + '"]')
      .click({ force: true })
      .wait(1000)

      .get("#study-start-date")
      .click({ waitForAnimations: false })
      .get(".DayPickerInput-OverlayWrapper")
      .click({ force: true })
      .find(".DayPicker-Day.DayPicker-Day--today")
      .click({ force: true })

      .get(".start-page-input")
      .click({ force: true })
      .type("1")
      .should("have.value", "1")

      .get(".last-page-input")
      .click({ force: true })
      .type("50")
      .should("have.value", "50")

      .get(".page-time-input")
      .click({ force: true })
      .type("5")
      .should("have.value", "5")

      .get(".repeat-input")
      .click({ force: true })
      .type("2")
      .should("have.value", "2")

      .get(".notes-input")
      .click({ force: true })
      .type("I love Math!")
      .should("have.value", "I love Math!")

      .get(".study-link-input")
      .click({ force: true })
      .type("https://stanmmp.wixsite.com/stan")
      .should("have.value", "https://stanmmp.wixsite.com/stan")

      .get(".add-new-form-submit")
      .submit()
      .wait(1000)
    // ---------------------------------------

    cy.visit("/")
      // check calculations ----------
      .get(".today-goal")
      .contains("page 1 to 25 (rep. 1)")

      .get(".today-goal-duration")
      .contains("2 hrs 5 min")

      .get(".today-page-amount")
      .contains("0 / 25")

      .get(".today-page-nos")
      .contains("1 - 50")

      .get(".today-rep-cycles")
      .contains("1 / 2")

      // donut updates correctly ----------
      .get(".donut__text")
      .contains("0%")

      .wait(1000)

      // update some pages ----------
      .get("#page")
      .click({ force: true })
      .type("5")
      .should("have.value", "5")

      .get("#cycle")
      .click({ force: true })
      .type("1")
      .should("have.value", "1")

      .get("#study-chunk")
      .submit()

      // check calculations ----------
      .get(".today-goal")
      .contains("page 6 to 25 (rep. 1)")

      .get(".today-goal-duration")
      .contains("1 hr 40 min")

      .get(".today-page-amount")
      .contains("5 / 25")

      .get(".today-page-nos")
      .contains("1 - 50")

      .get(".today-rep-cycles")
      .contains("1 / 2")

      // donut updates correctly ----------
      .get(".donut__text")
      .contains("20%")

      .wait(1000)

      // update all ----------
      .get("#study-chunk-all")
      .submit()

      .wait(1000)

      // donut updates correctly ----------
      .get(".donut__text")
      .contains("100%")

    // --------------------------------------------------------
    // delete account ----------------
    cy.visit("/profile")
      .get(".button a")
      .click({ force: true })

      .get(".delete-button")
      .click({ force: true })

      .get(".delete-account-yes")
      .click({ force: true })
  })
})
