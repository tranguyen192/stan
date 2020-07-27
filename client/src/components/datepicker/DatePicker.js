import React from "react"
import DayPickerInput from "react-day-picker/DayPickerInput"
import "react-day-picker/lib/style.css"
import { formatDate, parseDate } from "react-day-picker/moment"
import moment from "moment"
// --------------------------------------------------------------

export default class DatePicker extends React.Component {
  constructor(props) {
    super(props)
    this.handleDayChange = this.handleDayChange.bind(this)
    this.state = {
      selectedDay: props.myValue || undefined,
    }
  }

  handleDayChange(selectedDay) {
    this.setState({
      selectedDay,
    })
    this.props.onDaySelected(selectedDay)
  }

  render() {
    const FORMAT = "DD.MM.yyyy"
    const today = new Date()

    let selectedDayFormatted = moment(
      this.state.selectedDay,
      "DD.MM.yyyy"
    ).toDate()

    // return ----------------
    return (
      <DayPickerInput
        value={this.state.selectedDay && selectedDayFormatted}
        onDayChange={this.handleDayChange}
        dayPickerProps={{
          selectedDays: this.state.selectedDay && selectedDayFormatted,
          firstDayOfWeek: 1,
          disabledDays: {
            before: today,
            after: this.props.disabledAfter,
          },
          modifiersStyles: {
            selected: {
              color: "white",
              backgroundColor: "#03719e",
            },
            today: {
              color: "#fec902",
            },
          },
        }}
        inputProps={{
          required: this.props.required,
          readOnly: "readOnly",
          id: this.props.id,
        }}
        formatDate={formatDate}
        format={FORMAT}
        parseDate={parseDate}
        placeholder={this.props.placeholder}
      />
    )
  }
}
