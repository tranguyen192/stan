import React, { initialState } from "react"
import useDarkMode from "use-dark-mode"
// --------------------------------------------------------------

const DarkModeToggle = () => {
  const darkMode = useDarkMode(initialState, {
    element: document.documentElement,
  })

  return (
    <button type="button" onClick={darkMode.toggle} className="dark-mode-btn">
      {darkMode.value ? "Light Mode" : "Dark Mode"}
    </button>
  )
}

export default DarkModeToggle
