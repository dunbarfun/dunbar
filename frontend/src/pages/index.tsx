import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useIsLoggedIn from '@/selectors/useIsLoggedIn'
import useIsOnboarded from '@/hooks/useIsOnboarded'
import useStore from '@/stores'
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    const router = useRouter()
    const isLoggedIn = useIsLoggedIn()
    const isOnboarded = useIsOnboarded()
    const user = useStore((state) => state.user.user)
    const seenWelcome = useStore((state) => state.user.seenWelcome)

    useEffect(() => {
        if (isLoggedIn) {
            if (isOnboarded) {
                router.push('/chats')
            } else if (!seenWelcome) {
                router.push('/onboarding/welcome')
            } else if (!user.name) {
                router.push('/onboarding/name')
            } else if (!user.username) {
                router.push('/onboarding/username')
            } else {
                router.push('/chats')
            }
        }
    }, [isLoggedIn, isOnboarded, user])

    return null
}
