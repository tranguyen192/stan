import React from "react"
// --------------------------------------------------------------

const Image = ({ path, alt, className }) => {
  // return ----------------
  return <img alt={alt} src={path} className={className} />
}

export default Image
