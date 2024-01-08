// @ts-nocheck
import { activity } from '@/mock/users'
import Image from 'next/image'
import { Menu, Transition } from '@headlessui/react'
import { BsFillGearFill } from 'react-icons/bs'
import { Fragment, useEffect, useMemo, useState } from 'react'
import useLogout from '@/selectors/useLogout'
import Sheet from 'react-modal-sheet'
import Button from '@/components/Button'
import useStore from '@/stores'
import useUpdateUser from '@/hooks/useUpdateUser'
import { QRCodeSVG } from 'qrcode.react'
import { copyToClipboard } from '@/utils/address'
import { apollo, gql } from '@/lib/apollo'

const MIST_PER_SUI = 1_000_000_000;

export function DepositSheet() {
    const user = useStore((state) => state.user.user)

    return (
        <Sheet.Container className="p-4">
            <Sheet.Header />
            <Sheet.Content className="flex flex-col items-center">
                <Image alt="wallet" src="/wallet.png" width={80} height={80} />
                <h1 className="font-medium text-2xl mt-4">
                    Deposit funds to your wallet
                </h1>
                <h1 className="text-base text-neutral-500 font-medium mt-2">
                    Copy or scan your wallet address
                </h1>
                <QRCodeSVG
                    className="rounded-md mt-2"
                    value={user?.wallet?.publicKey}
                />
                <Button
                    onClick={async () => {
                        await copyToClipboard(user?.wallet?.publicKey)
                        alert('🔒 Address copied')
                    }}
                    className="text-xl w-4/5 mt-4"
                >
                    Copy Address
                </Button>
            </Sheet.Content>
        </Sheet.Container>
    )
}

export function WithdrawSheet() {
    const user = useStore((state) => state.user.user)
    const [withdrawAddress, setWithdrawAddress] = useState('')

    return (
        <Sheet.Container className="p-4">
            <Sheet.Header />
            <Sheet.Content className="flex flex-col items-center">
                <Image alt="wallet" src="/wallet.png" width={80} height={80} />
                <h1 className="font-medium text-2xl mt-4">
                  Withdraw funds from your wallet
                </h1>
                <h1 className="text-base text-neutral-500 font-medium mt-2 mb-4">
                  Enter the SUI wallet address you want to withdraw all your funds to.
                </h1>
                <input
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="bg-rounded bg-neutral-100 focus:outline-none  text-black font-medium h-12 px-4 rounded-full w-full"
                  placeholder="Enter wallet address"
                />

                <Button
                    onClick={async () => {
                      // TODO: check if address is valid
                      await apollo.mutate({
                        mutation: gql`mutation Withdraw($address: String!) {
                          withdraw(address: $address)
                        }`,
                        variables: {
                          address: withdrawAddress
                        }
                      })
                      window.alert('Withdrawal completed!')
                    }}
                    className="text-xl w-4/5 mt-4"
                >
                  Withdraw
                </Button>
            </Sheet.Content>
        </Sheet.Container>
    )
}


export default function Profile() {
    const logout = useLogout()
    const [isOpen, setOpen] = useState(false)
    const [isWithdrawOpen, setWithdrawOpen] = useState(false)
    const user = useStore((state) => state.user.user)
    const updateUser = useUpdateUser()

    useEffect(() => {
        updateUser()
    })

    const snapPoints = useMemo(() => [0.5], [])

    return (
        <div className="flex flex-1 w-full flex-col px-8">
            <div className="w-full flex flex-row items-start justify-between py-8 h-24">
                <h1 className="text-3xl font-semibold">Profile</h1>
                <Sheet
                    snapPoints={snapPoints}
                    isOpen={isOpen}
                    onClose={() => setOpen(false)}
                >
                    <DepositSheet address={user?.wallet?.publicKey} />
                    <Sheet.Backdrop onTap={() => setOpen(false)} />
                </Sheet>
                <Sheet
                    snapPoints={snapPoints}
                    isOpen={isWithdrawOpen}
                    onClose={() => setWithdrawOpen(false)}
                >
                    <WithdrawSheet address={user?.wallet?.publicKey} />
                    <Sheet.Backdrop onTap={() => setWithdrawOpen(false)} />
                </Sheet>

                <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button>
                        <div className="bg-neutral-200 rounded-full p-[4px] w-9 h-9 flex flex-col items-center justify-center">
                            <BsFillGearFill
                                size={20}
                                className="text-neutral-400 text-2xl"
                            />
                        </div>
                    </Menu.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                            <div className="px-1 py-1 ">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={logout}
                                            className={`${
                                                active
                                                    ? 'bg-red-300 text-white'
                                                    : 'text-gray-900'
                                            } group flex w-full font-medium items-center rounded-md px-2 py-2 text-sm`}
                                        >
                                            👋 Sign Out
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
            <div className="mt-2 mb-8 flex flex-row">
                <Image
                    src={user?.avatar || '/tree.png'}
                    width={80}
                    height={80}
                    className="rounded-full"
                    alt="avatar"
                />

                <div>
                    <h1 className="mx-4 font-medium text-2xl">{user.name}</h1>
                    <h2 className="mx-4 text-emerald-500 font-medium text-xl">
                        @{user.username}
                    </h2>
                </div>
            </div>
            <div className="flex flex-col justify-between bg-neutral-100 p-4 rounded-2xl w-full self-center h-48">
                <div className="flex flex-row items-center justify-between">
                    <h1 className="font-semibold text-2xl">Balance</h1>
                    <div>
                        <div className="flex flex-row">
                            <Image
                                src="/sui-black.svg"
                                className="mr-1.5"
                                width={18}
                                height={18}
                                alt="sui"
                            />
                            <h1 className="font-semibold text-2xl">
                                {user?.wallet?.balance}
                            </h1>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setOpen(true)}
                    className="bg-black rounded-full p-4 text-white font-bold text-xl"
                >
                    Deposit
                </button>
                <button
                    onClick={() => setWithdrawOpen(true)}
                    className="bg-black rounded-full p-4 text-white font-bold text-xl"
                >
                    Withdraw
                </button>
            </div>
            <Activity
            />
        </div>
    )
}

function Activity() {
  const [events, setEvents] = useState<any[]>([])
  const user = useStore((state) => state.user.user)
  useEffect(() => {
    const main = async () => {
      const res = await apollo.query({
        query: gql`query GetEvents {
          getEvents {
            is_buy
            price
            user {
              id
              username
              name
              avatar
            }
          }
        }`
      })
      console.log(res)
      setEvents(res.data.getEvents)
    }
    setInterval(() => {
      main()
    }, 10 * 1000)
  }, [])
    return (
        <div className="my-4 pb-20">
            <h1 className="font-semibold text-xl mb-4">Activity</h1>
            {events.map((e, idx) => (
                <div key={idx} className="flex flex-row gap-y-4 h-20">
                    <div className="relative items-start flex flex-col h-20 w-16">
                        <Image
                            height={40}
                            width={40}
                            className="rounded-full absolute"
                            src={user?.avatar || '/tree.png'}
                            alt="avatar"
                        />
                        <Image
                            height={40}
                            width={40}
                            className="rounded-full absolute top-4 left-4"
                            src={e?.user?.avatar || '/tree.png'}
                            alt="avatar"
                        />
                    </div>
                    <div>
                        <div
                            className="font-medium text-base ml-2 pt-2"
                            key={idx}
                        >
                            {user.name} {e.is_buy ? 'bought' : 'sold'}{' '}
                            1 of{' '}
                            <span className="text-emerald-500">
                                {e.user.name}'s
                            </span>{' '}
                            seeds for {e.price / MIST_PER_SUI} SUI
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
