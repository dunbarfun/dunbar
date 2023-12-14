// @ts-nocheck
import { createClient, Client, ClientOptions } from 'graphql-ws'
import useStore from '@/stores'
const GRAPHQL_SUBSCRIPTION_URL =
    process.env.NEXT_PUBLIC_GRAPHQL_SUBSCRIPTION_URL

function getFreshToken() {
    const token = useStore.getState().user.token
    return token
}

interface RestartableClient extends Client {
    restart(): void
}

// all subscriptions from `client.subscribe` will resubscribe after `client.restart`
function createRestartableClient(options: ClientOptions): RestartableClient {
    let restartRequested = false
    let restart = () => {
        restartRequested = true
    }

    const client = createClient({
        ...options,
        on: {
            ...options.on,
            connecting: () => {
                console.log('ws connecting')
            },
            connected: () => {
                console.log('ws connected')
            },
            closed: (code, reason) => {
                console.log('ws closed', code, reason)
            },
            opened: (socket) => {
                console.log('ws opened', socket)
                options.on?.opened?.(socket)

                restart = () => {
                    if (socket.readyState === WebSocket.OPEN) {
                        // if the socket is still open for the restart, do the restart
                        socket.close(4205, 'Client Restart')
                    } else {
                        // otherwise the socket might've closed, indicate that you want
                        // a restart on the next opened event
                        restartRequested = true
                    }
                }

                // just in case you were eager to restart
                if (restartRequested) {
                    restartRequested = false
                    restart()
                }
            },
        },
    })

    return {
        ...client,
        restart: () => restart(),
    }
}

export default createRestartableClient({
    url: GRAPHQL_SUBSCRIPTION_URL,
    connectionParams: () => {
        const token = getFreshToken()
        return { token }
    },
    shouldRetry: () => true,
    retryAttempts: 10,
    retryWait: async (retries) => {
        console.log('retryWait', retries)
        // taken directly from the docs at https://github.com/enisdenjo/graphql-ws#retry-strategy
        // after the server becomes ready, wait for a second + random 1-4s timeout
        // (avoid DDoSing yourself) and try connecting again
        await new Promise((resolve) =>
            setTimeout(resolve, 1000 + Math.random() * 3000)
        )
    },
})
