import TabBar from '@/components/TabBar'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import useStore from '@/stores'
import useIsLoggedIn from '@/selectors/useIsLoggedIn'
import Login from '@/components/Login'
import LoginRedirect from '@/pages/login/redirect'
import ChatService from '@/services/ChatService'

const inter = Inter({ subsets: ['latin'] })

function App({ Component, pageProps }: AppProps) {
    const router = useRouter()
    const isLoggedIn = useIsLoggedIn()

    if (router.pathname === '/login/redirect') {
        return <LoginRedirect />
    }

    function hideTabBar() {
        const excludedPaths = [
            '/chat/[chatId]',
            '/onboarding/welcome',
            '/onboarding/name',
            '/onboarding/username',
            '/onboarding/avatar',
        ]

        return excludedPaths.includes(router.pathname)
    }

    if (!isLoggedIn) {
        return <Login />
    }

    return (
        <main
            className={`flex min-h-screen h-full flex-col items-center justify-between ${inter.className}`}
        >
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
            />
            <Component {...pageProps} />
            <ChatService />
            {hideTabBar() ? null : <TabBar />}
        </main>
    )
}

export default dynamic(() => Promise.resolve(App), { ssr: false })
