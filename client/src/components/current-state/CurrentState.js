import React, { lazy } from "react"
// --------------------------------------------------------------

// query ----------------
import { CURRENT_USER } from "../../graphQL/users/queries"

// helpers ----------------
import { currentMood } from "../../helpers/general"

// motivational sayings ----------------
import motivationalSayings from "./json/motivational-sayings.json"

// libraries ----------------
import Carousel from "react-bootstrap/Carousel"

// apolloClient cache ----------------
import { client } from "../../apolloClient"

// components ----------------
const Image = lazy(() => import("../../components/image/Image"))

// random number ----------------
const random = Math.floor(Math.random() * 3)

const CurrentState = ({ todaysProgress }) => {
  // run query in cache ----------------
  const currentUser = client.readQuery({ query: CURRENT_USER }).currentUser

  // variables & default values ----------------
  let mood = "okay"
  let motivation

  mood = currentMood(todaysProgress)
  motivationalSayings.forEach(element => {
    if (mood === element.mood && element.id === random) {
      motivation = element.motivation
    }
  })

  // return ----------------
  return (
    <div className="current-state">
      <div className="current-state__mascot">
        <Carousel
          wrap={true}
          interval={30000}
          indicators={false}
          controls={false}
          autoPlay={true}
        >
          <Carousel.Item>
            <Image
              path={require(`../../images/mascots/${
                currentUser.mascot
              }-${mood.replace(/ /g, "")}-0.svg`)}
              alt="stan mascot"
            />
          </Carousel.Item>

          <Carousel.Item>
            <Image
              path={require(`../../images/mascots/${
                currentUser.mascot
              }-${mood.replace(/ /g, "")}-1.svg`)}
              alt="stan mascot with hair bow"
            />
          </Carousel.Item>

          <Carousel.Item>
            <Image
              path={require(`../../images/mascots/${
                currentUser.mascot
              }-${mood.replace(/ /g, "")}-2.svg`)}
              alt="stan mascot with graduation hat"
            />
          </Carousel.Item>
        </Carousel>
      </div>
      <div className="current-state__motivation">
        <p>{motivation}</p>
      </div>
    </div>
  )
}

export default CurrentState
