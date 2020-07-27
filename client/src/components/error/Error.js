import React from "react"
// --------------------------------------------------------------

const QueryError = ({ errorMessage }) => {
  // return ----------------
  return (
    <div className="query-error">
      <div className="container-fluid">
        <div className="row">
          <div className="query-error__inner box-content">
            <div className="query-error__inner--headline">
              <h3>Something went wrong...</h3>
            </div>

            <div className="query-error__inner--text">
              <p>
                The server isn't responding. You might just need to refresh the
                page or login again. If you still see this error message, please
                contact us at{" "}
                <a href="mailto:medien@fh-salzburg.ac.at">
                  stan.studyplan@gmail.com
                </a>
                .
              </p>

              <p className="error">{errorMessage}</p>
            </div>

            <div className="query-error__inner--button">
              <a href="/" className="stan-btn-primary">
                Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QueryError
