import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)

export function getNumberOfDays(startDate, examDate) {
  //source: https://stackoverflow.com/a/2627493 &  https://stackoverflow.com/a/17727953
  const start = Date.UTC(
    examDate.getFullYear(),
    examDate.getMonth(),
    examDate.getDate()
  )
  const end = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  )

  const oneDay = 24 * 60 * 60 * 1000 // hours*minutes*seconds*milliseconds
  return Math.round(Math.abs((start - end) / oneDay))
}

export function formatDate(string) {
  let options = { year: "numeric", month: "numeric", day: "numeric" }
  return new Date(string).toLocaleDateString("en-GB", options)
}

export function minuteToHours(num) {
  let hours = num / 60
  let roundedHours = Math.floor(hours)
  let minutes = (hours - roundedHours) * 60
  let roundedMinutes = Math.round(minutes)

  let finalHour, finalMinute
  if (roundedHours > 1) finalHour = roundedHours + " hrs "
  if (roundedHours <= 1) finalHour = roundedHours + " hr "
  if (roundedMinutes > 1 || roundedMinutes <= 1)
    finalMinute = roundedMinutes + " min"
  if (roundedHours === 0) finalHour = ""
  if (roundedMinutes === 0) finalMinute = ""

  return finalHour + finalMinute
}

export function minuteToHoursShort(num) {
  let hours = num / 60
  let roundedHours = Math.floor(hours)
  let minutes = (hours - roundedHours) * 60
  let roundedMinutes = Math.round(minutes)

  let finalHour, finalMinute
  if (roundedHours > 1 || roundedHours <= 1) finalHour = roundedHours + "h "
  if (roundedMinutes > 1 || roundedMinutes <= 1)
    finalMinute = roundedMinutes + "m"
  if (roundedHours === 0) finalHour = ""
  if (roundedMinutes === 0) finalMinute = ""

  return finalHour + finalMinute
}
