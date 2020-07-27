import tinycolor from "tinycolor2";

export function getBackgroundColor(color, args) {
  const tinycolorResp = tinycolor(color);
  if (tinycolorResp.isValid()) return color;
  return generateSubjectColor(args);
}

export function generateTextColor(backgroundColor) {
  const backgroundColorBrightness = tinycolor(backgroundColor).getBrightness();
  //255 shades, 5 different possible grades in the frontend, the two darkest ones should have a white text color
  if (backgroundColorBrightness <= (255 / 5) * 2) return "#ffffff";
  return "#000000";
}

//middle color
//fist light
function generateSubjectColor(exam) {
  const hexCharsFirstTwoDigits = ["A", "B", "C", "D", "E", "F"]; //(red)
  const hexCharsSecondTwoDigits = [9, "A", "B", "C", "D", "E", "F"]; //(green)
  const hexCharsThirdTwoDigits = [9, "A", "B", "C", "D", "E", "F"]; //(blue)
  const colorNumbers = [];
  let subjectAsciiNumber = 0;
  for (let i = 0; i < exam.subject.length; i++) {
    subjectAsciiNumber += exam.subject.charCodeAt(i);
  }
  colorNumbers.push(
    Math.round(subjectAsciiNumber * Math.random() * 10) % hexCharsFirstTwoDigits.length
  );

  colorNumbers.push(
    Math.round(exam.examDate.getDay() + exam.examDate.getMonth() * Math.random() * 10) %
      hexCharsFirstTwoDigits.length
  );
  colorNumbers.push(
    Math.round(exam.startDate.getDay() + exam.startDate.getMonth() * Math.random() * 10) %
      hexCharsSecondTwoDigits.length
  );
  colorNumbers.push(
    Math.round(exam.numberPages * exam.timesRepeat * Math.random() * 10) %
      hexCharsSecondTwoDigits.length
  );
  colorNumbers.push(exam.timePerPage % hexCharsThirdTwoDigits.length);
  colorNumbers.push(
    (colorNumbers[0] + colorNumbers[1] + colorNumbers[2] + colorNumbers[3] + colorNumbers[4]) %
      hexCharsThirdTwoDigits.length
  );
  let color = "#";
  let counter = 0;
  colorNumbers.forEach(colorNumber => {
    if (counter < 2) color += hexCharsFirstTwoDigits[colorNumber].toString();
    else if (counter < 4) color += hexCharsSecondTwoDigits[colorNumber].toString();
    else color += hexCharsThirdTwoDigits[colorNumber].toString();
    counter++;
  });

  return color;
}
