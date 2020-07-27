import React, { forwardRef } from "react"
// --------------------------------------------------------------

const Input = ({ value, label, placeholder, type, id, className }, ref) => {
  // return ----------------
  return (
    <input
      ref={ref}
      type={type}
      id={id}
      name={label}
      placeholder={placeholder}
      value={value}
      className={className}
    />
  )
}

export default forwardRef(Input)
