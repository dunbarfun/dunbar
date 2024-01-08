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
 


    <div
      className="flex flex-col min-h-screen"
    >
      <div className="flex flex-row justify-between items-center p-8">
        <div
          className="flex flex-row justify-center items-center"
        >
          <img
            src="/icon.svg"
            alt="logo"
            className="w-10 h-10"
          />
          <h1
            className="text-3xl font-semibold ml-2"
          >Dunbar</h1>
        </div>
      </div>
      <div
        className="flex flex-col flex-grow justify-center items-center"
      >
        <div
          className="flex flex-col xl:flex-row justify-center items-center xl:mt-8"
        >
          <img
            src="/landing.svg"
            className="xl:absolute xl:w-96 xl:left-8 xl:-mt-32 xl:-z-10 -rotate-45 xl:rotate-0 -mt-64"
          />
          <div
            className="flex flex-col justify-center items-center xl:my-0 my-8"
          >
          <h1
            className="text-5xl font-semibold text-center"
          >Trade your tribe</h1>
          <p
            className="text-xl text-center mt-4 text-gray-400 font-medium"
          >Mint and trade your friends on Dunbar</p>
            
            <Button className="mt-12" onClick={loginWithGoogle}>
                Login with Google
            </Button>
          </div>
          <img
            src="/landing.svg"
            className="xl:absolute xl:right-8 xl:-mt-32 xl:-z-10 hidden xl:block"
            style={{ transform: 'scaleX(-1)' }}
          />
        </div>
      </div>

        </div>
    )
}
