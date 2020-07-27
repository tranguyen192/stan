const {
  verifyEmail,
  verifyUsername,
  verifyPassword,
  verifySubject,
  verifyExamDate,
  verifyStudyStartDate,
  verifyPageAmount,
  verifyPageTime,
  verifyPageRepeat,
  verifyCurrentPage,
  verifyPageNotes,
} = require("../../../src/helpers/verifyUserInput")

test("verifies string is formatted as an email", () => {
  expect(verifyEmail("ntroth.mmt-b2017@fh-salzburg.ac.at")).toBeTruthy()
  expect(verifyEmail("n@f.at")).toBeTruthy()
  expect(verifyEmail("123.-3@d.at")).toBeTruthy()
  expect(verifyEmail("very.common@example.com")).toBeTruthy()
  expect(
    verifyEmail("disposable.style.email.with+symbol@example.com")
  ).toBeTruthy()
  expect(verifyEmail("other.email-with-hyphen@example.com")).toBeTruthy()
  expect(verifyEmail("fully-qualified-domain@example.com")).toBeTruthy()
  expect(verifyEmail("user.name+tag+sorting@example.com")).toBeTruthy()
  expect(verifyEmail("example-indeed@strange-example.com")).toBeTruthy()
  expect(verifyEmail("example@s.example")).toBeTruthy()
  expect(verifyEmail('" "@example.org')).toBeTruthy()
  expect(verifyEmail('"john..doe"@example.org')).toBeTruthy()
  expect(verifyEmail("mailhost!username@example.org")).toBeTruthy()
  expect(verifyEmail("user%example.com@example.org")).toBeTruthy()
  expect(verifyEmail("a".repeat(64) + "@example.com")).toBeTruthy()
  expect(
    verifyEmail("a".repeat(64) + "@" + "a".repeat(251) + ".com")
  ).toBeTruthy()

  expect(verifyEmail("@fh-salzburg.ac.at")).toBeFalsy()
  expect(verifyEmail("Abc.example.com")).toBeFalsy()
  expect(verifyEmail("A@b@c@example.com")).toBeFalsy()
  expect(verifyEmail('a"b(c)d,e:f;g<h>i[jk]l@example.com')).toBeFalsy()
  // expect(verifyEmail('just"not"right@example.com')).toBeFalsy();
  // expect(verifyEmail('this is"notallowed@example.com')).toBeFalsy();
  expect(verifyEmail('this still"not\\allowed@example.com')).toBeFalsy()
  expect(verifyEmail("")).toBeFalsy()
  expect(verifyEmail("b".repeat(65) + "@example.com")).toBeFalsy()
  expect(
    verifyEmail("a".repeat(64) + "@" + "a".repeat(252) + ".com")
  ).toBeFalsy()
})

test("verifies string is formatted as a username", () => {
  testVariousChars(verifyUsername)
  expect(verifyUsername("%")).toBeTruthy()
  expect(verifyUsername("c".repeat(30))).toBeTruthy()

  expect(verifyUsername("d".repeat(31))).toBeFalsy()
  expect(verifyUsername("")).toBeFalsy()
})

test("verifies string is formatted as a password", () => {
  testVariousChars(verifyPassword)
  expect(verifyPassword("e".repeat(30))).toBeTruthy()

  expect(verifyPassword("f".repeat(31))).toBeFalsy()
  expect(verifyPassword("g".repeat(7))).toBeFalsy()
  expect(verifyPassword("")).toBeFalsy()
})

test("verifies string is formatted as a subject", () => {
  testVariousChars(verifySubject)
  expect(verifySubject("Maths")).toBeTruthy()
  expect(verifySubject("h".repeat(20))).toBeTruthy()
  expect(verifySubject("k")).toBeTruthy()

  expect(verifySubject("i".repeat(21))).toBeFalsy()
  expect(verifySubject("")).toBeFalsy()
})

test("verifies string is formatted as an exam date", () => {
  dateTests(verifyExamDate)
  expect(verifyExamDate("")).toBeFalsy()
})

test("verifies string is formatted as a study start date", () => {
  dateTests(verifyStudyStartDate)
  expect(verifyStudyStartDate("")).toBeTruthy()
})

test("verifies string is formatted as a page amount", () => {
  testNumbers(verifyPageAmount)
  expect(verifyPageAmount("1".repeat(10000))).toBeTruthy()

  expect(verifyPageAmount("1".repeat(10001))).toBeFalsy()
  expect(verifyPageAmount("")).toBeFalsy()
})

test("verifies string is formatted as a page time", () => {
  testNumbers(verifyPageTime)
  expect(verifyPageTime("1".repeat(600))).toBeTruthy()
  expect(verifyPageTime("")).toBeTruthy()

  expect(verifyPageTime("1".repeat(601))).toBeFalsy()
})

test("verifies string is formatted as a page repeat", () => {
  testNumbers(verifyPageRepeat)
  expect(verifyPageRepeat("1".repeat(1000))).toBeTruthy()
  expect(verifyPageRepeat("")).toBeTruthy()

  expect(verifyPageRepeat("1".repeat(1001))).toBeFalsy()
})

test("verifies string is formatted as a current page", () => {
  testNumbers(verifyCurrentPage)
  expect(verifyCurrentPage("1".repeat(10000))).toBeTruthy()
  expect(verifyCurrentPage("")).toBeTruthy()

  expect(verifyCurrentPage("1".repeat(10001))).toBeFalsy()
})

test("verifies string is formatted as notes", () => {
  testVariousChars(verifyPageNotes)
  expect(verifyPageNotes("c".repeat(100000000))).toBeTruthy()
  expect(verifyPageNotes("")).toBeTruthy()

  expect(verifyPageNotes("d".repeat(100000001))).toBeFalsy()
})

//------------------------------------------HELPER FUNCTIONS------------------------------------------
function testVariousChars(regexFunction) {
  testAllAsciiChars(regexFunction)
  expect(regexFunction("dsfj3$%fdsdf")).toBeTruthy()
  expect(regexFunction("di4sz$§d")).toBeTruthy()
  expect(regexFunction('kls7$5469!"')).toBeTruthy()
  expect(regexFunction("§$%&/()=?$§d")).toBeTruthy()
  expect(
    regexFunction(
      "\u0030\u0031\u0032\u0033\u0034\u0035\u0036\u0037\u0038\u0039"
    )
  ).toBeTruthy()
}

function testAllAsciiChars(regexFunction) {
  let asciiChars = ""
  for (let i = 32; i < 127; ++i) {
    asciiChars += String.fromCharCode(i)
    if (asciiChars.length >= 8) {
      expect(regexFunction(asciiChars)).toBeTruthy()
      asciiChars = ""
    }
  }
}

function testNumbers(regexFunction) {
  expect(regexFunction("11")).toBeTruthy()
  expect(regexFunction("1234567890")).toBeTruthy()
  expect(regexFunction("\u0035")).toBeTruthy()

  expect(regexFunction("!\"§$%&/()=?*+'#-_.:,;")).toBeFalsy()
  expect(regexFunction("di4sz45$§")).toBeFalsy()
}

function dateTests(dateFunction) {
  expect(dateFunction("11-12-2020")).toBeTruthy()
  expect(dateFunction("2020-12-11")).toBeTruthy()
  expect(dateFunction("05.06.2020")).toBeTruthy()
  expect(dateFunction("05.06.2020")).toBeTruthy()
  expect(dateFunction("2023.12.2")).toBeTruthy()
  expect(dateFunction("01/12/2020")).toBeTruthy()
  expect(dateFunction("2016/05/7")).toBeTruthy()
  // expect(dateFunction("1609369200000")).toBeTruthy();

  expect(dateFunction("0-0-0")).toBeFalsy()
  expect(dateFunction("00-00-0000")).toBeFalsy()
  expect(dateFunction("05.06.20")).toBeFalsy()
  expect(dateFunction("32.12.2020")).toBeFalsy()
  expect(dateFunction("30/13/2020")).toBeFalsy()
  expect(dateFunction("dd-0-0")).toBeFalsy()
  expect(dateFunction("32.mm.2020")).toBeFalsy()
  expect(dateFunction("30/13/yyyy")).toBeFalsy()
  expect(dateFunction("0-0-0")).toBeFalsy()
  expect(dateFunction("32.12.2020")).toBeFalsy()
  expect(dateFunction("30/13/2020")).toBeFalsy()
  expect(dateFunction("123454")).toBeFalsy()
  expect(dateFunction("di4sz$§")).toBeFalsy()
}
