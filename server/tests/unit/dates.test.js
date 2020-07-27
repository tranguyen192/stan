import {
  datesTimingIsValid,
  startDateIsActive,
  isTheSameDay,
  getNumberOfDays,
  date1IsBeforeDate2,
  datesAreNotPast
} from "../../helpers/dates";

test("verifies datesTimingIsValid", () => {
  expect(datesTimingIsValid(new Date("2120.12.01"), new Date("2121.12.01"))).toBeTruthy();
  expect(datesTimingIsValid(new Date("01.12.2120"), new Date("01.12.2121"))).toBeTruthy();
  expect(datesTimingIsValid(new Date("2120.12.01"), new Date("2121.12.03"))).toBeTruthy();
  expect(datesTimingIsValid(new Date("2120.12.01"), new Date("2221.12.03"))).toBeTruthy();
  expect(datesTimingIsValid(new Date("2120.12.02"), new Date("2120.12.01"))).toBeFalsy();
  expect(datesTimingIsValid(new Date("1920.12.01"), new Date("2121.12.01"))).toBeFalsy();
  expect(datesTimingIsValid(new Date("2120.12.01"), new Date("1920.12.01"))).toBeFalsy();
  expect(datesTimingIsValid(new Date("2120.12.01"), new Date("2120.12.01"))).toBeFalsy();
});

test("verifies startDateIsActive", () => {
  expect(startDateIsActive(new Date("1990.12.01"))).toBeTruthy();
  expect(startDateIsActive(getFutureDay(new Date(), -1))).toBeTruthy();
  expect(startDateIsActive(new Date())).toBeTruthy();
  expect(startDateIsActive(new Date("1990.12.01"))).toBeTruthy();
  expect(startDateIsActive(getFutureDay(new Date(), 1))).toBeFalsy();
});

test("verifies isTheSameDay", () => {
  expect(isTheSameDay(new Date("1990.12.01"), new Date("1990.12.01"))).toBeTruthy();
  expect(isTheSameDay(new Date("1990.12.05"), new Date("1990.12.01"))).toBeFalsy();
});
test("verifies datesAreNotPast", () => {
  expect(datesAreNotPast([new Date("2990.12.01"), new Date("2990.12.01")])).toBeTruthy();
  expect(datesAreNotPast([new Date("1990.12.01"), new Date("2990.12.01")])).toBeFalsy();
  expect(datesAreNotPast([new Date("1990.12.01"), new Date("1990.12.01")])).toBeFalsy();
});

test("verifies numberOfDaysLeft", () => {
  expect(getNumberOfDays(new Date("2120.12.01"), new Date("2120.12.02"))).toBe(1);
  expect(getNumberOfDays(new Date("2120.12.05"), new Date("2120.12.10"))).toBe(5);
  expect(getNumberOfDays(new Date("2120-04-01"), new Date("2120-04-10"))).toBe(9);
});

//new Date(year, month, day, hours, minutes, seconds, milliseconds)
test("verifies date1IsBeforeDate2", () => {
  expect(
    date1IsBeforeDate2(
      new Date("2120", "04", "22", "20", "45", "43"),
      new Date("2120", "04", "22", "20", "46", "43")
    )
  ).toBeTruthy();
  expect(
    date1IsBeforeDate2(
      new Date("2120", "04", "22", "20", "45", "43"),
      new Date("2120", "04", "22", "20", "45", "44")
    )
  ).toBeTruthy();
  expect(
    date1IsBeforeDate2(
      new Date("2120", "05", "22", "20", "45", "43"),
      new Date("2120", "04", "22", "20", "46", "43")
    )
  ).toBeFalsy();
});

function getFutureDay(date, numberDaysInFuture) {
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + numberDaysInFuture);
  return new Date(nextDay);
}
