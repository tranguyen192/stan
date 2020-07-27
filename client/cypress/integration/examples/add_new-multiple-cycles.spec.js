/// <reference types="cypress" />
import moment from "moment"
// --------------------------------------------------------------

// set date for Date Picker ----------------
let date = new Date()
let futureDate = date.setDate(date.getDate() + 1)
let dateFormatDatePicker = moment(futureDate).format("ddd MMMM DD YYYY")
// --------------------------------------------------------

describe("Cypress", () => {
  it("is working", () => {
    expect(true).to.equal(true)
  })
})

describe("add exam (multiple cycles) and mark as completed", () => {
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
      .type("5")
      .should("have.value", "5")

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
      .contains("page 1 to 50 (rep. 5)")

      .get(".today-goal-duration")
      .contains("20 hrs 50 min")

      .get(".today-page-amount")
      .contains("0 / 250")

      .get(".today-page-nos")
      .contains("1 - 50")

      .get(".today-rep-cycles")
      .contains("1 / 5")

      .get(".timeline__bar__text")
      .contains("250 left")

      .get(".today__container__content__text--warning")
      .contains("Info: You have to study multiple repetition cycles today")

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
      .contains("page 6 to 50 (rep. 5)")

      .get(".today-goal-duration")
      .contains("20 hrs 25 min")

      .get(".today-page-amount")
      .contains("5 / 250")

      .get(".today-page-nos")
      .contains("1 - 50")

      .get(".today-rep-cycles")
      .contains("1 / 5")

      .get(".timeline__bar__text")
      .contains("245 left")

      .get(".today__container__content__text--warning")
      .contains("Info: You have to study multiple repetition cycles today")

      // donut updates correctly ----------
      .get(".donut__text")
      .contains("2%")

      .wait(1000)

      // update some pages ----------
      .get("#page")
      .click({ force: true })
      .type("10")
      .should("have.value", "10")

      .get("#cycle")
      .click({ force: true })
      .type("3")
      .should("have.value", "3")

      .get("#study-chunk")
      .submit()

      // check calculations ----------
      .get(".today-goal")
      .contains("page 11 to 50 (rep. 5)")

      .get(".today-goal-duration")
      .contains("11 hrs 40 min")

      .get(".today-page-amount")
      .contains("110 / 250")

      .get(".today-page-nos")
      .contains("1 - 50")

      .get(".today-rep-cycles")
      .contains("3 / 5")

      .get(".timeline__bar__text")
      .contains("140 left")

      .get(".today__container__content__text--warning")
      .contains("Info: You have to study multiple repetition cycles today")

      // donut updates correctly ----------
      .get(".donut__text")
      .contains("44%")

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
