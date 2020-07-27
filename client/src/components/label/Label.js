import React from "react"
// --------------------------------------------------------------

const Label = ({ labelType, text, className }) => {
  // return ----------------
  return (
    <label htmlFor={labelType} className={className}>
      {text}
    </label>
  )
}

export default Label
