import Button from '@/components/Button'
import Image from 'next/image'
import useStore from '@/stores'
import { useRouter } from 'next/router'
import useUpdateUser from '@/hooks/useUpdateUser'
import { useState } from 'react'
import { apollo } from '@/lib/apollo'
import { UPDATE_USER } from '@/graphql/users'

export default function Avatar() {
    const router = useRouter()
    const updateUser = useUpdateUser()
    const [avatar, setAvatar] = useState(
        'https://pbs.twimg.com/profile_images/1728783465380720640/lsvlT9e6_400x400.jpg'
    )

    const update = async () => {
        await apollo.mutate({
            mutation: UPDATE_USER,
            variables: {
                avatar,
            },
        })
        await updateUser()
        router.push('/chats')
    }

    return (
        <div className="flex flex-col flex-1 justify-between w-full p-8">
            <div className="flex flex-col">
                <Image
                    className="items-start"
                    src="/logo.png"
                    width={100}
                    height={100}
                    alt="tree"
                />
                <h1 className="mt-2 font-semibold text-2xl text-black">
                    Upload an avatar
                </h1>
                <h2 className="mt-2 font-medium text-neutral-400 text-lg">
                    Almost time to make some degen bets
                </h2>
            </div>
            <Button
                onClick={update}
                disabled={!avatar}
                className="bg-gradient-to-b from-emerald-400 to-emerald-500 text-xl"
            >
                Continue
            </Button>
        </div>
    )
}
