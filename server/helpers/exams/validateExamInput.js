import {
  verifyRegexSubject,
  verifyRegexPageAmount,
  verifyRegexPageTime,
  verifyRegexPageRepeat,
  // verifyRegexHexColor,
  verifyRegexCurrentPage,
  verifyRegexPageNotes,
  verifyRegexUrlLink
} from "../verifyInput";
import { UserInputError } from "apollo-server";

import { removeWhitespace } from "../generalHelpers";
import { datesTimingIsValid, isTheSameDay, date1IsBeforeDate2 } from "../dates";
import validator from "validator";

export function verifyExamInput(args) {
  //regex
  verifyNewExamInputFormat(args);
  if (isTheSameDay(args.startDate, args.examDate)) {
    throw new UserInputError(
      "Careful! You shouldn't start learning on the same day as the test. Start date should be at least 1 day before the test."
    );
  }
}

function verifyNewExamInputFormat(args) {
  verifySubjectFormat(args.subject);
  verifyLastPageFormat(args.lastPage);
  verifyTimePerPageFormat(args.timePerPage);
  verifyTimesRepeatFormat(args.timesRepeat);
  verifyStartPageFormat(args.startPage);
  verifyNotesFormat(args.notes);
  verifyStudyMaterialLinksFormat(args.studyMaterialLinks);
}

function verifySubjectFormat(subject) {
  if (!verifyRegexSubject(subject))
    throw new UserInputError(
      "Subject input has the wrong format. It cannot be empty. Max length 50 characters."
    );
}

export function verifyAddExamDates(startDate, examDate) {
  if (!datesTimingIsValid(startDate, examDate))
    throw new UserInputError(
      "Dates cannot be in the past and start learning date must be before exam date."
    );
}

export function verifyUpdateExamDates(startDate, examDate, oldStartDate) {
  if (isTheSameDay(startDate, oldStartDate)) {
    if (!date1IsBeforeDate2(startDate, examDate))
      throw new UserInputError("Start learning date must be before exam date.");
  } else verifyAddExamDates(startDate, examDate);
}

function verifyLastPageFormat(lastPage) {
  if (!verifyRegexPageAmount(lastPage.toString()))
    throw new UserInputError(
      "Number of pages input has the wrong format. It must be a positive number and cannot be empty. Max length 10000 characters."
    );
}

function verifyTimePerPageFormat(timePerPage) {
  if (!verifyRegexPageTime(timePerPage.toString()) || timePerPage <= 0)
    throw new UserInputError(
      "Time per page input has the wrong format. It must be a positive number and cannot be empty. Max length 600 characters."
    );
}

function verifyTimesRepeatFormat(timesRepeat) {
  if (timesRepeat != null && !verifyRegexPageRepeat(timesRepeat.toString()))
    throw new UserInputError(
      "Times to repeat input has the wrong format. It must be a positive number.  Max length 1000 characters."
    );
}

function verifyStartPageFormat(currentPage) {
  if (currentPage != null && !verifyRegexCurrentPage(currentPage.toString()))
    throw new UserInputError(
      "Start page input has the wrong format. It must ve a positive number.  Max length 10000 characters."
    );
}

function verifyStudyMaterialLinksFormat(studyMaterialLinks) {
  if (!studyMaterialLinks) return;
  if (studyMaterialLinks.length === 0) return;

  studyMaterialLinks.forEach(link => {
    link = removeWhitespace(link);
    if (link === null || !validator.isURL(link) || !verifyRegexUrlLink(link))
      throw new UserInputError(
        "All the study material links have to be URLs (websites) (e.g. https://stan-studyplan.herokuapp.com)."
      );
  });
}

function verifyNotesFormat(notes) {
  if (notes != null && !verifyRegexPageNotes(notes))
    throw new UserInputError(
      "Notes input has the wrong format. It cannot exceed 100000000 characters."
    );
}
