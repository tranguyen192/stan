import React from "react"
import Stan from "../../images/mascots/0-stressed-1.svg"
// --------------------------------------------------------------

const NoMatch404 = () => {
  // return ----------------
  return (
    <div className="no-match">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-md-10">
            <h2 className="no-match__headline">Awww...Don't Cry.</h2>
            <h3 className="no-match__sub-headline">It's just a 404 Error!</h3>
            <p className="no-match__content">
              What you're looking for may have been misplaced in Long Term
              Memory..
            </p>

            <div className="no-match__mascot">
              <img
                src={Stan}
                alt="Sad stan"
                className="no-match__mascot--img"
              />
            </div>
          </div>
          <div className="col-md-1"></div>
        </div>
      </div>
    </div>
  )
}

export default NoMatch404
