import { calcPagesLeft } from "./chunkHelpers";
import { startDateIsActive, getNumberOfDays, isTheSameDay, getPastDay } from "../dates";
import { fetchUncompletedExams } from "./examHelpers";

export async function fetchCalendarChunks(userId) {
  const exams = await fetchUncompletedExams(userId);
  return getCalendarChunks(exams);
}

function getCalendarChunks(exams) {
  const calendarChunks = [];
  const calendarExams = [];

  // to avoid division by daysleft = 0 -> and no longer need to show this exam
  exams = exams.filter(exam => !isTheSameDay(exam.examDate, new Date()));

  for (let i = 0; i < exams.length; i++) {
    const exam = exams[i];
    let dayToStartCounting = exam.startDate;
    if (startDateIsActive(exam.startDate)) dayToStartCounting = new Date();
    const daysLeft = getNumberOfDays(dayToStartCounting, exam.examDate);

    const numberPagesLeftTotal = calcPagesLeft(
      exam.numberPages,
      exam.timesRepeat,
      exam.startPage,
      exam.currentPage
    );

    let numberPagesPerDay;
    if (daysLeft === 0) numberPagesPerDay = 0;
    else numberPagesPerDay = Math.ceil(numberPagesLeftTotal / daysLeft);
    let dayBeforeExam = getPastDay(exam.examDate, 1);

    calendarChunks.push({
      title: exam.subject,
      start: exam.startDate,
      end: dayBeforeExam,
      color: exam.color,
      textColor: exam.textColor,
      extendedProps: {
        examDate: exam.examDate,
        currentPage: exam.currentPage,
        numberPagesLeftTotal,
        numberPagesPerDay,
        durationTotal: numberPagesLeftTotal * exam.timePerPage,
        durationPerDay: Math.ceil(numberPagesPerDay * exam.timePerPage),
        studyMaterialLinks: exam.studyMaterialLinks || []
      }
    });

    calendarExams.push({
      title: exam.subject,
      start: exam.examDate,
      end: exam.examDate,
      color: "#ff554d"
    });
  }
  return { calendarChunks, calendarExams };
}
