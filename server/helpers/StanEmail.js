import nodemailer from "nodemailer";
export default class StanEmail {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.STAN_EMAIL,
        pass: process.env.STAN_EMAIL_PASSWORD
      }
    });
  }

  sendSignupMail(recipientEmail, mascot) {
    const subject = "Welcome to stan!";
    const h1 = `Welcome to stan...`;
    const text = `<p>It's so nice to meet you! We hope you enjoy all the features that stan has to offer. Add your first exam directly from the dashboard, keep track of your upcoming exams in the calendar view. But most importantly, toggle between light and dark mode!</p><p>We hope stan can help you with your upcoming exams!</p><p>Good luck and happy learning!</p>`;

    this.sendMail(recipientEmail, subject, text, h1, mascot);
  }

  sendDeleteAccountMail(recipientEmail, mascot) {
    const subject = "Goodbye :(";
    const h1 = `Sorry to hear you are leaving...`;
    const text = `<p>We're sorry to hear that you have decided to stop using stan. Please remember, you are always welcome back! We have deleted all your data, so if you decide to visit again, be sure to create a new account. Until then, good luck, we wish you the best!</p>
    <p>If you were unhappy with stan or you have ideas for improvements, please send us an <a href="mailto:stan.studyplan@gmail.com">email</a> and tell us what we can do better to help other students.</p>`;

    this.sendMail(recipientEmail, subject, text, h1, mascot);
  }

  sendForgottenPasswordMail(recipientEmail, link) {
    const subject = "Reset Password";
    const h1 = `Reset your password...`;
    const text = `<p>Don't worry, it's only human to forget things. Click <a href=" ${link}">here</a> to reset your password. This link is only valid for 10 minutes. If you run out of time, request another link on the forgotten password page.</p>`;

    this.sendMail(recipientEmail, subject, text, h1);
  }

  sendExamDateReminderMail(
    recipientEmail,
    examsInOneDay,
    examsInThreeDays,
    startDatesToday,
    mascot
  ) {
    let totalExamsLength = examsInOneDay.length + examsInThreeDays.length + startDatesToday.length;
    let examWord = "Exam";
    if (totalExamsLength > 1) examWord = "Exams";
    if (totalExamsLength === 1) totalExamsLength = "";
    let examsListString = "";
    if (examsInOneDay.length > 0) {
      examsListString += `<b>${examsInOneDay.length} ${
        examsInOneDay.length > 1 ? "exams" : "exam"
      } tomorrow:</b><ul>${this.createExamsListString(examsInOneDay)}</ul>`;
    }
    if (examsInThreeDays.length > 0) {
      examsListString += `<b>${examsInThreeDays.length} ${
        examsInThreeDays.length > 1 ? "exams" : "exam"
      } in three days' time:</b><ul>${this.createExamsListString(examsInThreeDays)}</ul>`;
    }
    if (startDatesToday.length > 0) {
      examsListString += `<p><b>You need to start learning for the following ${
        startDatesToday.length > 1 ? "exams" : "exam"
      } today:</b></p>
      <ul>${this.createExamsListString(
        startDatesToday
      )}</ul> <br><p>Please don't forget to learn, you still have time. Good luck!</p>
      `;
    }

    const subject = `${examWord} coming up!`;
    const h1 = `Reminder that you have the following ${examWord.toLowerCase()} coming up`;
    const text = `<p>stan wanted to remind you about the ${examWord.toLowerCase()} you have coming up, which you may not have finished learning for yet.</p>${examsListString}`;

    this.sendMail(recipientEmail, subject, text, h1, mascot);
  }

  createExamsListString(exams) {
    let examsListString = "";
    exams.forEach(exam => {
      examsListString += `<li>${exam}</li>`;
    });
    return examsListString;
  }

  sendExamDeleteAccountWarning(recipientEmail, daysUntilDelete, mascot) {
    const subject = "Your account will be deleted soon";
    const h1 = `You haven't visited stan in a while...`;
    const text = `<p>stan will automatically delete your account after a year of not being used. Your exams and account will be deleted ${
      daysUntilDelete > 1 ? "in " + daysUntilDelete + " days" : "tomorrow"
    }, if you don't login to it before then.</p><p>We hope to see you soon!</p>`;
    this.sendMail(recipientEmail, subject, text, h1, mascot);
  }

  sendMail(to, subject, text, h1, mascot = 0) {
    let image = `${mascot}-emailStan.svg`;
    const html = `<style>*{font-family: Verdana, sans-serif}</style><h1 style="color:#00729e">${h1}</h1>${text}<br><p><img style="width: 220px" src="cid:unique@stan.com"/></p>`;

    const mailOptions = {
      from: process.env.STAN_EMAIL,
      to,
      subject,
      html,
      attachments: [
        {
          filename: "stan.svg",
          path: `${__dirname}/images/${image}`,
          cid: "unique@stan.com" //same cid value as in the html img src
        }
      ]
    };

    this.transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
}
