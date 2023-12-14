import Button from '@/components/Button'
import Image from 'next/image'
import useStore from '@/stores'
import { useRouter } from 'next/router'

export default function Welcome() {
    const setSeenWelcome = useStore((state) => state.user.setSeenWelcome)
    const router = useRouter()

    return (
        <div className="flex flex-col flex-1 justify-between w-full p-8">
            <div className="flex flex-col">
                <Image
                    className="items-start"
                    src="/tree.png"
                    width={100}
                    height={100}
                    alt="tree"
                />
                <h1 className="mt-2 font-semibold text-2xl text-black">
                    Welcome to Dunbar
                </h1>
                <h2 className="mt-2 font-medium text-neutral-500 text-lg">
                    On Dunbar, you can mint and trade your friends seeds which
                    gives you direct access to their clubhouse. Seeds are priced
                    on a bonding curve and are limited at 150 per friend, so
                    there’s a limited supply.
                </h2>
            </div>
            <Button
                onClick={() => {
                    setSeenWelcome(true)
                    router.push('/')
                }}
                className="bg-gradient-to-b from-emerald-400 to-emerald-500 text-xl"
            >
                Continue
            </Button>
        </div>
    )
}
