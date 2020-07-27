import React, { initialState } from "react"
import Particles from "react-particles-js"
import useDarkMode from "use-dark-mode"

const ParticlesComponent = () => {
  // dark mode specific ----------------
  const darkMode = useDarkMode(initialState, {
    element: document.documentElement,
  })
  let particleColor
  if (darkMode.value) {
    particleColor = "#ffffff"
  } else {
    particleColor = "#000000"
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: "100%",
      }}
    >
      <Particles
        params={{
          particles: {
            number: {
              value: 160,
              density: {
                enable: false,
              },
            },
            color: {
              value: particleColor,
            },
            size: {
              value: 3,
              random: true,
              anim: {
                speed: 4,
                size_min: 0.3,
              },
            },
            line_linked: {
              enable: false,
            },
            move: {
              random: true,
              speed: 1,
              direction: "top",
              out_mode: "out",
            },
          },
          interactivity: {
            events: {
              onhover: {
                enable: true,
                mode: "bubble",
              },
              onclick: {
                enable: true,
                mode: "repulse",
              },
            },
            modes: {
              bubble: {
                distance: 250,
                duration: 2,
                size: 0,
                opacity: 0,
              },
              repulse: {
                distance: 400,
                duration: 4,
              },
            },
          },
        }}
      />
    </div>
  )
}

export default ParticlesComponent
