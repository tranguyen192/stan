import React from "react"
import { Link } from "react-router-dom"
// --------------------------------------------------------------

const ListingLink = ({ text, className, link, linkText }) => {
  // return ----------------
  return (
    <li className={className}>
      <Link to={link} href={link}>
        {linkText}
      </Link>
      {text}
    </li>
  )
}

export default ListingLink
