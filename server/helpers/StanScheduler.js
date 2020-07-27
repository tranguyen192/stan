import schedule from "node-schedule";

import { User, Exam } from "./../models";
import { getNumberOfDays, isTheSameDay, date1IsBeforeDate2 } from "./dates";
import StanEmail from "./StanEmail";
const stanEmail = new StanEmail();
import { deleteExamsTodaysCache } from "./exams/chunkHelpers";
import { deleteUsersData, deleteUser } from "./users/deleteUser";
import { fetchUncompletedExams } from "./exams/examHelpers";

export default class StanScheduler {
  constructor() {
    this.init();
  }

  init() {
    schedule.scheduleJob({ hour: 2, minute: 30 }, async () => {
      this.completePastExams();
      this.removeNoLongerNeededCache();
      this.notifyAndDeleteOldUsers();
      this.notifyUsersAboutExams();
    });
  }

  async notifyUsersAboutExams() {
    const users = await User.find({ allowEmailNotifications: true });
    users.forEach(async user => {
      const examsInOneDay = [];
      const examsInThreeDays = [];
      const startDatesToday = [];
      const exams = await fetchUncompletedExams(user._id);
      exams.forEach(exam => {
        const numberOfDaysUntilExam = getNumberOfDays(new Date(), exam.examDate);

        if (numberOfDaysUntilExam === 1) examsInOneDay.push(exam.subject);
        if (numberOfDaysUntilExam === 3) examsInThreeDays.push(exam.subject);

        if (isTheSameDay(new Date(), exam.startDate)) startDatesToday.push(exam.subject);
      });

      if (examsInOneDay.length > 0 || examsInThreeDays.length > 0 || startDatesToday.length > 0)
        stanEmail.sendExamDateReminderMail(
          user.email,
          examsInOneDay,
          examsInThreeDays,
          startDatesToday,
          user.mascot
        );
    });
  }

  async completePastExams() {
    const exams = await Exam.find({
      completed: false
    });

    exams.forEach(async exam => {
      if (date1IsBeforeDate2(exam.examDate, new Date())) {
        await Exam.updateOne({ _id: exam._id }, { completed: true, updatedAt: new Date() });
        await deleteExamsTodaysCache(exam.userId, exam._id);
      }
    });
  }

  async removeNoLongerNeededCache() {
    const exams = await Exam.find({
      completed: true
    });
    exams.forEach(async exam => {
      await deleteExamsTodaysCache(exam.userId, exam._id);
    });
  }

  async notifyAndDeleteOldUsers() {
    const users = await User.find();
    users.forEach(async user => {
      const daysSinceLastVisited = getNumberOfDays(user.lastVisited, new Date());
      if (daysSinceLastVisited === 365)
        stanEmail.sendExamDeleteAccountWarning(user.email, 1, user.mascot);
      else if (daysSinceLastVisited >= 366) {
        await deleteUsersData(user._id);
        await deleteUser(user._id);
        stanEmail.sendDeleteAccountMail(user.email, user.mascot);
      } else if (daysSinceLastVisited >= 336 && user.sentOneMonthDeleteReminder === false) {
        stanEmail.sendExamDeleteAccountWarning(user.email, 366 - daysSinceLastVisited, user.mascot);
        await User.updateOne(
          { _id: user._id },
          { sentOneMonthDeleteReminder: true, updatedAt: new Date() }
        );
      }
    });
  }
}
