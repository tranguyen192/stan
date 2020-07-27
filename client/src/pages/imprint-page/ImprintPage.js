import React, { lazy } from "react"
// --------------------------------------------------------------

// image ----------------
import Stan from "../../images/mascots/iAmStan.svg"

// sub-components
const Image = lazy(() => import("../../components/image/Image"))

const Imprint = () => {
  // return ----------------
  return (
    <div className="imprint">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-1"></div>
          <div className="col-m-10">
            <div className="imprint__headline">
              <h2>Imprint</h2>
            </div>

            <div className="imprint__team">
              <p>This is a MultiMedia Project 3 by Natasha, Tra and Daniela.</p>

              <Image
                path={Stan}
                alt="a mascot is holding up a letter"
                className="imprint__team--mascot"
              />
            </div>

            <div className="imprint__address">
              <p>
                Fachhochschule Salzburg GmbH
                <br></br>
                Urstein Süd 1<br></br>
                A-5412
                <br></br>
                Puch/Salzburg Österreich
              </p>
            </div>

            <div className="imprint__contact-details">
              <div className="imprint__contact-details--block">
                <p>
                  <strong>T </strong>
                  <a
                    href="tel:+435022110"
                    className="imprint__contact-details--link"
                  >
                    +43 50-2211-0
                  </a>
                </p>
                <p>
                  <strong>Mail </strong>
                  <a
                    href="mailto:medien@fh-salzburg.ac.at"
                    className="imprint__contact-details--link"
                  >
                    stan.studyplan@gmail.com
                  </a>
                </p>
              </div>
            </div>

            <div className="imprint__copyright">
              <p>© 2020 FH Salzburg</p>
            </div>
          </div>
          <div className="col-md-1"></div>
        </div>
      </div>
    </div>
  )
}

export default Imprint
