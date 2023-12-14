import Button from '@/components/Button'
import { BsDiscord, BsGoogle } from 'react-icons/bs'
import { getUrl } from '@/utils/url'
import supabase from '@/lib/supabase'
import Image from 'next/image'

export default function Login() {
    const loginWithGoogle = async () => {
        supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: getUrl() + '/login/redirect',
            },
        })
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Image
                className="mb-4"
                alt="logo"
                src="/logo.png"
                width={100}
                height={100}
            />
            <h1 className="text-2xl font-semibold">Welcome to Dunbar</h1>
            <Button className="mt-4" onClick={loginWithGoogle}>
                Login with Google
            </Button>
        </div>
    )
}
