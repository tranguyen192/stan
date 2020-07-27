import React from "react"
// --------------------------------------------------------------

// components ----------------
import Input from "../../components/input/Input"

function TestAddNew({ onSubmit }) {
  // return ----------------
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault()
          const {
            subject,
            examDate,
            studyStartDate,
            pageAmount,
            pageTime,
            pageRepeat,
            pageNotes,
          } = e.target.elements
          onSubmit({
            subject: subject.value,
            examDate: examDate.value,
            studyStartDate: studyStartDate.value,
            pageAmount: pageAmount.value,
            pageTime: pageTime.value,
            pageRepeat: pageRepeat.value,
            pageNotes: pageNotes.value,
          })
        }}
      >
        <label htmlFor="subject" className="add-new__form__element__label">
          Subject
        </label>
        <input
          className="add-new__form__element__input"
          type="text"
          id="subject"
          label="subject"
          placeholder="Math"
          required
          data-testid="required-input-subject"
        />

        <label htmlFor="examDate" className="add-new__form__element__label">
          examDate
        </label>
        <input
          className="add-new__form__element__input"
          type="date"
          id="examDate"
          label="examDate"
          placeholder="DD/MM/YYYY"
          required
          data-testid="required-input-examdate"
        />

        <label
          htmlFor="studyStartDate"
          className="add-new__form__element__label"
        >
          studyStartDate
        </label>
        <Input
          className="add-new__form__element__input"
          type="date"
          id="studyStartDate"
          label="examStartDate"
          placeholder="DD/MM/YYYY"
        />

        <label htmlFor="pageAmount" className="add-new__form__element__label">
          pageAmount
        </label>
        <input
          className="add-new__form__element__input"
          type="number"
          min="0"
          id="pageAmount"
          label="pageAmount"
          placeholder="829"
          required
          data-testid="required-input-pageamount"
        />

        <label htmlFor="pageTime" className="add-new__form__element__label">
          pageTime
        </label>
        <Input
          className="add-new__form__element__input"
          type="number"
          min="0"
          id="pageTime"
          label="pageTime"
          placeholder="5 min"
        />

        <label htmlFor="pageRepeat" className="add-new__form__element__label">
          pageRepeat
        </label>
        <Input
          className="add-new__form__element__input"
          type="number"
          id="pageRepeat"
          label="pageRepeat"
          placeholder="2 times"
        />

        <label htmlFor="pageNotes" className="add-new__form__element__label">
          pageNotes
        </label>
        <textarea
          className="add-new__form__element__input"
          id="pageNotes"
          label="pageNotes"
          placeholder="..."
        ></textarea>

        <button
          data-testid="button"
          type="submit"
          className="stan-btn-primary"
          variant="button"
        >
          submit
        </button>
      </form>
    </div>
  )
}

export default TestAddNew
