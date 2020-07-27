import dayjs from "dayjs";
import { verifyRegexDate } from "./verifyInput";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export function isDateInvalid(value) {
  return (
    !value || value.length <= 0 || isNaN(Date.parse(value)) || !verifyRegexDate(value.toString())
  );
}

export function datesTimingIsValid(startDate, examDate) {
  return datesAreNotPast([startDate, examDate]) && date1IsBeforeDate2(startDate, examDate);
}

export function startDateIsActive(startDate) {
  return isToday(startDate) || dayjs(startDate).isBefore(dayjs());
}

export function isTheSameDay(date1, date2) {
  const date1Formatted = dayjs(date1).format("DD/MM/YYYY");
  const date2Formatted = dayjs(date2).format("DD/MM/YYYY");
  return date1Formatted === date2Formatted;
}

export function getNumberOfDays(startDate, endDate) {
  //source: https://stackoverflow.com/a/2627493 &  https://stackoverflow.com/a/17727953
  const start = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const end = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const numberOfDays = Math.round((start - end) / oneDay);

  if (numberOfDays < 0) return 0;
  return numberOfDays;
}

//------------------------HELPERS--------------------

export function datesAreNotPast(dates) {
  for (let i = 0; i < dates.length; i++) {
    //if today is after the date, then it is in the past
    if (dayjs(dates[i]).isBefore(dayjs()) && !isToday(dates[i])) {
      return false;
    }
  }
  return true;
}

export function date1IsBeforeDate2(date1, date2) {
  return dayjs(date1).isBefore(dayjs(date2));
}

export function getPastDay(date, numberDaysInPast) {
  const pastDay = new Date(date);
  pastDay.setDate(date.getDate() - numberDaysInPast);
  return new Date(pastDay);
}

//modified from https://flaviocopes.com/how-to-determine-date-is-today-javascript/
function isToday(date) {
  const today = new Date();
  return (
    date.getDate() == today.getDate() &&
    date.getMonth() == today.getMonth() &&
    date.getFullYear() == today.getFullYear()
  );
}
