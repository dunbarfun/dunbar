// @ts-nocheck
const GRAPHQL_URL = process.env.NEXT_PUBLIC_BACKEND_URL + '/graphql'
const GRAPHQL_SUBSCRIPTION_URL =
    process.env.NEXT_PUBLIC_GRAPHQL_SUBSCRIPTION_URL

import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    HttpLink,
    useQuery,
    useMutation,
    useSubscription,
    gql,
    from,
    ApolloLink,
    split,
} from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { onError } from 'apollo-link-error'
import lodash from 'lodash'
import useStore from '@/stores'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import graphqlWsClient from '@/lib/graphqlWsClient'

const httpLink = new HttpLink({
    uri: GRAPHQL_URL,
})

const wsLink = new GraphQLWsLink(graphqlWsClient)

const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) =>
            console.error(
                `[GraphQL error]: Message: ${JSON.stringify(
                    message
                )}, Location: ${JSON.stringify(locations)}, Path: ${path}`
            )
        )
    }
    if (networkError) console.error(`[Network error]: ${networkError}`)
})

const authLink = new ApolloLink((operation, forward) => {
    const token = useStore.getState().user.token
    operation.setContext(({ headers }) => ({
        headers: {
            'x-access-token': token,
            ...headers,
        },
    }))
    return forward(operation)
})

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query)
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        )
    },
    wsLink,
    authLink.concat(errorLink).concat(httpLink)
)

const apollo = new ApolloClient({
    uri: GRAPHQL_URL,
    cache: new InMemoryCache(),
    link: splitLink,
})

export { apollo, gql, useQuery, useMutation, ApolloProvider, useSubscription }
