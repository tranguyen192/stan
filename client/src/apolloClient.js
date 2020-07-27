import "./App.scss"
import { getAccessToken, setAccessToken } from "./accessToken"

import { ApolloClient } from "apollo-client"
import { InMemoryCache } from "apollo-cache-inmemory"
import { HttpLink } from "apollo-link-http"
import { onError } from "apollo-link-error"

import { ApolloLink, Observable } from "apollo-link"
import jwtDecode from "jwt-decode"
import { TokenRefreshLink } from "apollo-link-token-refresh"

const cache = new InMemoryCache({})

//src: https://www.apollographql.com/docs/react/migrating/boost-migration/#advanced-migration
const requestLink = new ApolloLink(
  (operation, forward) =>
    new Observable(observer => {
      let handle
      Promise.resolve(operation)
        .then(oper => {
          //from old apollo boost client
          const accessToken = getAccessToken()
          if (accessToken) {
            oper.setContext({
              headers: {
                Authorization: accessToken ? `bearer ${accessToken}` : "",
              },
            })
          }
        })
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          })
        })
        .catch(observer.error.bind(observer))

      return () => {
        if (handle) handle.unsubscribe()
      }
    })
)

export const client = new ApolloClient({
  link: ApolloLink.from([
    new TokenRefreshLink({
      accessTokenField: "accessToken",
      isTokenValidOrUndefined: () => {
        //checks if token is valid - called in every graphql request - only does something if token is invalid though
        const token = getAccessToken()

        if (!token) {
          return true
        }

        try {
          //exp = expires
          const { exp } = jwtDecode(token)
          //if currentdate is bigger than the expiration date of the accesstoken - times 1000 for seconds/milliseconds
          if (Date.now() >= exp * 1000) {
            return false
          } else {
            return true
          }
        } catch (err) {
          console.error(err)
          return false
        }
      },
      fetchAccessToken: () => {
        //if token is not valid
        return fetch("/refresh_token", {
          method: "POST",
          credentials: "include",
          // headers: {},
        })
      },
      //read access token from response
      handleFetch: accessToken => {
        //set accesstoken
        setAccessToken(accessToken)
      },

      handleError: err => {
        //called whenever try to fetch accesstoken (fetch post request - but shouldn't be called)
        // full control over handling token fetch Error
        console.warn("Your refresh token is invalid. Try to relogin")
        console.error(err)

        // // your custom action here
        // user.logout()
      },
    }),

    onError(({ graphQLErrors, networkError }) => {
      //TODO-AUTH
      console.log(graphQLErrors)
      console.log(networkError)
      // if (graphQLErrors) {
      //   sendToLoggingService(graphQLErrors)
      // }
      // if (networkError) {
      //   logoutUser()
      // }
    }),
    requestLink,

    new HttpLink({
      uri: "/graphql",
      credentials: "include",
    }),
  ]),
  cache,
})
