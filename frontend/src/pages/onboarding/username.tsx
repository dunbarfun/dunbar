import Button from '@/components/Button'
import Image from 'next/image'
import useStore from '@/stores'
import { useRouter } from 'next/router'
import useUpdateUser from '@/hooks/useUpdateUser'
import { useEffect, useState } from 'react'
import { apollo } from '@/lib/apollo'
import { UPDATE_USER } from '@/graphql/users'

export default function Username() {
    const router = useRouter()
    const updateUser = useUpdateUser()
    const [name, setName] = useState('')

    const user = useStore((state) => state.user.user)

    useEffect(() => {
        if (user.username) {
            router.push('/')
        }
    }, [user])

    const updateName = async () => {
        await apollo.mutate({
            mutation: UPDATE_USER,
            variables: {
                username: name,
            },
        })
        await updateUser()
        router.push('/onboarding/avatar')
    }

    return (
        <div className="flex flex-col flex-1 justify-between w-full p-8">
            <div className="flex flex-col">
                <Image
                    className="items-start"
                    src="/key.png"
                    width={100}
                    height={100}
                    alt="tree"
                />
                <h1 className="mt-2 font-semibold text-2xl text-black">
                    Pick a username
                </h1>
                <h2 className="mt-2 font-medium text-neutral-400 text-lg">
                    Make it unique and short
                </h2>
                <input
                    className="bg-neutral-100 focus:outline-emerald-400 font-medium  rounded-2xl mt-4 px-4 py-4 text-black"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="suzhu"
                />
            </div>
            <Button
                onClick={updateName}
                disabled={!name}
                className="bg-gradient-to-b from-emerald-400 to-emerald-500 text-xl"
            >
                Continue
            </Button>
        </div>
    )
}
