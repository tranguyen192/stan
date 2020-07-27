export function verifyRegexEmail(string) {
  if (!verifyStringFormat(string)) return false;
  //the upper limit is normally 254 - but older addresses might still be 320
  if (!string.match(/^.{1,320}$/)) return false;
  const emailRegex = /^([\w_\-."+!#$%&'*/=?^`{|}~ ]{1,64})@([\w_\-.]+)\.([a-z]+)$/;
  if (!string.match(emailRegex)) return false;
  let domain = string.split("@")[1];
  if (!domain.match(/^.{1,255}$/)) return false;
  return true;
}

export function verifyRegexUsername(string) {
  if (!verifyStringFormat(string)) return false;
  return string.match(/^.{1,30}$/);
}

export function verifyRegexPassword(string) {
  if (!verifyStringFormat(string)) return false;
  return string.match(/^.{8,30}$/);
}

export function verifyRegexMascot(string) {
  if (!verifyStringFormat(string)) return false;
  return string.match(/^.{1}$/) && string.match(/[012]/);
}

//--------------EXAMS--------------
export function verifyRegexSubject(string) {
  if (!verifyStringFormat(string)) return false;
  return string.match(/^.{1,50}$/);
}

export function verifyRegexDate(string) {
  if (!verifyStringFormat(string)) return false;
  if (!validateRegexDate(string)) return false;
  return true;
}

export function verifyRegexPageAmount(string) {
  if (!verifyStringFormat(string)) return false;
  return string.match(/^\d{1,10000}$/);
}

export function verifyRegexPageTime(string) {
  if (!verifyStringFormat(string)) return false;
  return string.match(/^\d{1,600}$/);
}

export function verifyRegexPageRepeat(string) {
  if (!verifyStringFormat(string)) return false;
  return string.match(/^\d{0,1000}$/);
}

export function verifyRegexCurrentPage(string) {
  if (!verifyStringFormat(string)) return false;
  return string.match(/^\d{0,10000}$/);
}

export function verifyRegexUrlLink(string) {
  if (!verifyStringFormat(string)) return false;
  return string.match(
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
  );
}

export function verifyRegexPageNotes(string) {
  if (!verifyStringFormat(string)) return false;
  //Regex returns: RangeError: Maximum call stack size exceeded at String.match (<anonymous>)
  // return string.match(/^.{0,100000000}$/);
  if (string.length > 100000000) return false;
  return true;
}

function validateRegexDate(string) {
  if (!verifyStringFormat(string)) return false;
  let regexDateOne = /^(0?[1-9]|[12][0-9]|3[01])[-|/|.](0?[1-9]|1[012])[-|/|.]\d{4}$/; //dd/mm/yyyy
  let regexDateTwo = /^\d{4}[-|/|.](0?[1-9]|1[012])[-|/|.](0?[1-9]|[12][0-9]|3[01])$/; //yyyy/mm/dd
  let regexDateThree = /^(0?[1-9]|1[012])[-|/|.](0?[1-9]|[12][0-9]|3[01])[-|/|.]\d{4}$/; //mm/dd/yyyy
  if (!string.match(regexDateOne) && !string.match(regexDateTwo) && !string.match(regexDateThree))
    return false;
  return true;
}

function verifyStringFormat(string) {
  return typeof string === "string";
}
