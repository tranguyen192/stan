import React from "react"
// --------------------------------------------------------------

const Button = ({ variant, text, className, onClick, disabled, hide }) => {
  // return ----------------
  return (
    <button
      type="submit"
      variant={variant}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      <p className="hide-visually">{hide}</p>
      {text}
    </button>
  )
}

export default Button
