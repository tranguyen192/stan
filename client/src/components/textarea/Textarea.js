import React, { forwardRef } from "react"
// --------------------------------------------------------------

const Textarea = (
  { value, onChange, label, placeholder, maxLength, id, className },
  ref
) => {
  // return ----------------
  return (
    <textarea
      ref={ref}
      id={id}
      name={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      className={className}
    />
  )
}

export default forwardRef(Textarea)
