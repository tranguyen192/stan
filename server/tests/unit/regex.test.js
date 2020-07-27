import {
  verifyRegexEmail,
  verifyRegexUsername,
  verifyRegexPassword,
  verifyRegexMascot,
  verifyRegexSubject,
  verifyRegexDate,
  verifyRegexPageAmount,
  verifyRegexPageTime,
  verifyRegexPageRepeat,
  verifyRegexCurrentPage,
  verifyRegexPageNotes,
  verifyRegexUrlLink
} from "../../helpers/verifyInput";

test("verifies string is formatted as an email", () => {
  expect(verifyRegexEmail("ntroth.mmt-b2017@fh-salzburg.ac.at")).toBeTruthy();
  expect(verifyRegexEmail("n@f.at")).toBeTruthy();
  expect(verifyRegexEmail("123.-3@d.at")).toBeTruthy();
  expect(verifyRegexEmail("very.common@example.com")).toBeTruthy();
  expect(verifyRegexEmail("disposable.style.email.with+symbol@example.com")).toBeTruthy();
  expect(verifyRegexEmail("other.email-with-hyphen@example.com")).toBeTruthy();
  expect(verifyRegexEmail("fully-qualified-domain@example.com")).toBeTruthy();
  expect(verifyRegexEmail("user.name+tag+sorting@example.com")).toBeTruthy();
  expect(verifyRegexEmail("example-indeed@strange-example.com")).toBeTruthy();
  expect(verifyRegexEmail("example@s.example")).toBeTruthy();
  expect(verifyRegexEmail('" "@example.org')).toBeTruthy();
  expect(verifyRegexEmail('"john..doe"@example.org')).toBeTruthy();
  expect(verifyRegexEmail("mailhost!username@example.org")).toBeTruthy();
  expect(verifyRegexEmail("user%example.com@example.org")).toBeTruthy();
  expect(verifyRegexEmail("a".repeat(64) + "@example.com")).toBeTruthy();
  expect(verifyRegexEmail("a".repeat(64) + "@" + "a".repeat(251) + ".com")).toBeTruthy();

  expect(verifyRegexEmail("@fh-salzburg.ac.at")).toBeFalsy();
  expect(verifyRegexEmail("Abc.example.com")).toBeFalsy();
  expect(verifyRegexEmail("A@b@c@example.com")).toBeFalsy();
  expect(verifyRegexEmail('a"b(c)d,e:f;g<h>i[jk]l@example.com')).toBeFalsy();
  expect(verifyRegexEmail('this still"not\\allowed@example.com')).toBeFalsy();
  expect(verifyRegexEmail("")).toBeFalsy();
  expect(verifyRegexEmail("b".repeat(65) + "@example.com")).toBeFalsy();
  expect(verifyRegexEmail("a".repeat(64) + "@" + "a".repeat(252) + ".com")).toBeFalsy();
});

test("verifies string is formatted as a username", () => {
  testVariousChars(verifyRegexUsername);
  expect(verifyRegexUsername("%")).toBeTruthy();
  expect(verifyRegexUsername("c".repeat(30))).toBeTruthy();

  expect(verifyRegexUsername("d".repeat(31))).toBeFalsy();
  expect(verifyRegexUsername("")).toBeFalsy();
});

test("verifies string is formatted as a password", () => {
  testVariousChars(verifyRegexPassword);
  expect(verifyRegexPassword("e".repeat(30))).toBeTruthy();

  expect(verifyRegexPassword("f".repeat(31))).toBeFalsy();
  expect(verifyRegexPassword("g".repeat(7))).toBeFalsy();
  expect(verifyRegexPassword("")).toBeFalsy();
});

test("verifies string is formatted as a mascot", () => {
  expect(verifyRegexMascot("0")).toBeTruthy();
  expect(verifyRegexMascot("1")).toBeTruthy();
  expect(verifyRegexMascot("2")).toBeTruthy();

  for (let i = 3; i <= 500; i++) {
    expect(verifyRegexMascot(i.toString())).toBeFalsy();
  }
  for (let i = -1; i >= -500; i--) {
    expect(verifyRegexMascot(i.toString())).toBeFalsy();
  }

  expect(verifyRegexMascot("e".repeat(30))).toBeFalsy();
  expect(verifyRegexMascot("g")).toBeFalsy();
  expect(verifyRegexMascot("")).toBeFalsy();
});

test("verifies string is formatted as a subject", () => {
  testVariousChars(verifyRegexSubject);
  expect(verifyRegexSubject("Maths")).toBeTruthy();
  expect(verifyRegexSubject("h".repeat(50))).toBeTruthy();
  expect(verifyRegexSubject("k")).toBeTruthy();

  expect(verifyRegexSubject("i".repeat(51))).toBeFalsy();
  expect(verifyRegexSubject("")).toBeFalsy();
});

test("verifies string is formatted as a date", () => {
  dateTests(verifyRegexDate);
  expect(verifyRegexDate("")).toBeFalsy();
});

test("verifies string is formatted as a page amount", () => {
  testNumbers(verifyRegexPageAmount);
  expect(verifyRegexPageAmount("1".repeat(10000))).toBeTruthy();

  expect(verifyRegexPageAmount("1".repeat(10001))).toBeFalsy();
  expect(verifyRegexPageAmount("-1")).toBeFalsy();
  expect(verifyRegexPageAmount("")).toBeFalsy();
});

test("verifies string is formatted as a page time", () => {
  testNumbers(verifyRegexPageTime);
  expect(verifyRegexPageTime("1".repeat(600))).toBeTruthy();

  expect(verifyRegexPageTime("1".repeat(601))).toBeFalsy();
  expect(verifyRegexPageTime("-1")).toBeFalsy();
  expect(verifyRegexPageTime("")).toBeFalsy();
});

test("verifies string is formatted as a page repeat", () => {
  testNumbers(verifyRegexPageRepeat);
  expect(verifyRegexPageRepeat("1".repeat(1000))).toBeTruthy();
  expect(verifyRegexPageRepeat("")).toBeTruthy();

  expect(verifyRegexPageRepeat("1".repeat(1001))).toBeFalsy();
  expect(verifyRegexPageRepeat("-1")).toBeFalsy();
});

test("verifies string is formatted as a current page", () => {
  testNumbers(verifyRegexCurrentPage);
  expect(verifyRegexCurrentPage("1".repeat(10000))).toBeTruthy();
  expect(verifyRegexCurrentPage("")).toBeTruthy();

  expect(verifyRegexCurrentPage("1".repeat(10001))).toBeFalsy();
  expect(verifyRegexCurrentPage("-1")).toBeFalsy();
});

test("verifies string is formatted as notes", () => {
  testVariousChars(verifyRegexPageNotes);
  expect(verifyRegexPageNotes("c".repeat(100000000))).toBeTruthy();
  expect(verifyRegexPageNotes("")).toBeTruthy();

  expect(verifyRegexPageNotes("d".repeat(100000001))).toBeFalsy();
});

test("verifies string is formatted as a URL Link", () => {
  expect(verifyRegexUrlLink("https://google.at")).toBeTruthy();
  expect(
    verifyRegexUrlLink("https://wiki.mediacube.at/wiki/index.php?title=Studiowoche")
  ).toBeTruthy();
  expect(verifyRegexUrlLink("https://stan-studyplan-staging.herokuapp.com/")).toBeTruthy();
  expect(verifyRegexUrlLink("https://stan-studyplan.herokuapp.com/")).toBeTruthy();

  expect(verifyRegexUrlLink("")).toBeFalsy();
  expect(verifyRegexUrlLink("ddsfhj8o345")).toBeFalsy();
  expect(verifyRegexUrlLink("https:/google.at")).toBeFalsy();
});

//------------------------------------------HELPER FUNCTIONS------------------------------------------
function testVariousChars(regexFunction) {
  testAllAsciiChars(regexFunction);
  expect(regexFunction("dsfj3$%fdsdf")).toBeTruthy();
  expect(regexFunction("di4sz$§d")).toBeTruthy();
  expect(regexFunction('kls7$5469!"')).toBeTruthy();
  expect(regexFunction("§$%&/()=?$§d")).toBeTruthy();
  expect(
    regexFunction("\u0030\u0031\u0032\u0033\u0034\u0035\u0036\u0037\u0038\u0039")
  ).toBeTruthy();
}

function testAllAsciiChars(regexFunction) {
  let asciiChars = "";
  for (let i = 32; i < 127; ++i) {
    asciiChars += String.fromCharCode(i);
    if (asciiChars.length >= 8) {
      expect(regexFunction(asciiChars)).toBeTruthy();
      asciiChars = "";
    }
  }
}

function testNumbers(regexFunction) {
  expect(regexFunction("11")).toBeTruthy();
  expect(regexFunction("1234567890")).toBeTruthy();
  expect(regexFunction("\u0035")).toBeTruthy();

  expect(regexFunction("!\"§$%&/()=?*+'#-_.:,;")).toBeFalsy();
  expect(regexFunction("di4sz45$§")).toBeFalsy();
}

function dateTests(dateFunction) {
  expect(dateFunction("11-12-2020")).toBeTruthy();
  expect(dateFunction("2020-12-11")).toBeTruthy();
  expect(dateFunction("05.06.2020")).toBeTruthy();
  expect(dateFunction("05.06.2020")).toBeTruthy();
  expect(dateFunction("2023.12.2")).toBeTruthy();
  expect(dateFunction("01/12/2020")).toBeTruthy();
  expect(dateFunction("2016/05/7")).toBeTruthy();

  expect(dateFunction("0-0-0")).toBeFalsy();
  expect(dateFunction("00-00-0000")).toBeFalsy();
  expect(dateFunction("05.06.20")).toBeFalsy();
  expect(dateFunction("32.12.2020")).toBeFalsy();
  expect(dateFunction("30/13/2020")).toBeFalsy();
  expect(dateFunction("dd-0-0")).toBeFalsy();
  expect(dateFunction("32.mm.2020")).toBeFalsy();
  expect(dateFunction("30/13/yyyy")).toBeFalsy();
  expect(dateFunction("0-0-0")).toBeFalsy();
  expect(dateFunction("32.12.2020")).toBeFalsy();
  expect(dateFunction("30/13/2020")).toBeFalsy();
  expect(dateFunction("123454")).toBeFalsy();
  expect(dateFunction("di4sz$§")).toBeFalsy();
}
