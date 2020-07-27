import React from "react"
// --------------------------------------------------------------

const burgerButton = props => (
  <button className="burger__btn" onClick={props.click}>
    <div className="burger__btn__line line-1" />
    <div className="burger__btn__line line-2" />
    <div className="burger__btn__line line-3" />
    <span className="hide-visually">Navigation</span>
  </button>
)

export default burgerButton
