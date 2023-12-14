// @ts-nocheck
import classNames from 'classnames'
import Image from 'next/image'
import { LuSearch } from 'react-icons/lu'
import SuiSvg from '../../public/sui.svg'
import { useEffect, useMemo, useState } from 'react'
import Sheet from 'react-modal-sheet'
import Button from '@/components/Button'
import { useQuery } from '@apollo/client'
import { GET_USERS, MINT_SEED } from '@/graphql/users'
import { apollo } from '@/lib/apollo'
import useStore from '@/stores'
import { truncateAddress } from '@/utils/address'
import useUpdateUser from '@/hooks/useUpdateUser'

export function MintSheet({ user, close }) {
    const me = useStore((state) => state.user.user)
    const updateUser = useUpdateUser()

    async function mint() {
        if (me?.wallet?.balance < user?.price) {
            alert('Insufficient funds, please top up your balance')
            return
        }
        await apollo.mutate({
            mutation: MINT_SEED,
            variables: {
                amount: 1,
                ofUserId: user.id,
            },
        })
        await updateUser()
        alert(`🌱 Minted ${user?.name}'s seed`)
        close()
    }
    return (
        <Sheet.Container className="p-4">
            <Sheet.Header />
            <Sheet.Content className="flex flex-col justify-between items-center">
                <Image
                    alt="wallet"
                    className="mt-2"
                    src="/seed.png"
                    width={100}
                    height={100}
                />
                <h1 className="font-medium text-2xl mt-4 text-black">
                    Mint <span className="text-emerald-500">{user.name}'s</span>{' '}
                    seed for {user?.price} SUI
                </h1>
                <h1 className="text-base text-neutral-500 font-medium mt-2"></h1>
                <div className="p-4 flex flex-row items-center justify-between bg-neutral-200 w-4/5 text-neutral-600 rounded-xl">
                    <p>{truncateAddress(me?.wallet?.publicKey)}</p>
                    <p>{me?.wallet?.balance} SUI</p>
                </div>

                <Button
                    onClick={mint}
                    className="text-xl w-4/5 mt-4 mb-4 bg-gradient-to-b from-emerald-400 to-emerald-500"
                >
                    Complete Purchase
                </Button>
            </Sheet.Content>
        </Sheet.Container>
    )
}

export default function Discover() {
    const [isOpen, setOpen] = useState(false)
    const snapPoints = useMemo(() => [0.5], [])
    const [searchTerm, setSearchTerm] = useState(undefined)
    const [selectedUser, setSelectedUser] = useState(null)
    const updateUser = useUpdateUser()
    const mint = async (user: any) => {
        await updateUser()
        setOpen(true)
        console.log('got user', user)
        setSelectedUser(user)
    }

    return (
        <div className="flex-1 w-full flex-col">
            <div className="top-0 w-full items-center justify-between p-8 flex h-24">
                <h1 className="text-3xl font-semibold">Discover</h1>
            </div>
            <div className="px-8">
                <div className="flex flex-row  items-center bg-neutral-100 rounded-full px-4">
                    <LuSearch size={24} />

                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-rounded bg-neutral-100 focus:outline-none  text-black font-medium h-12 px-2 rounded-full w-full"
                        placeholder="Search users"
                    />
                </div>
            </div>
            <UserList mint={mint} searchTerm={searchTerm} />
            <Sheet
                snapPoints={snapPoints}
                isOpen={isOpen}
                onClose={() => setOpen(false)}
            >
                <MintSheet close={() => setOpen(false)} user={selectedUser} />
                <Sheet.Backdrop onTap={() => setOpen(false)} />
            </Sheet>
        </div>
    )
}

type UserListProps = {
    searchTerm?: string
    mint: (user: any) => void
}

function UserList({ searchTerm, mint }: UserListProps) {
    const [users, setUsers] = useState(undefined)
    const me = useStore((state) => state.user.user)
    const [filteredUsers, setFilteredUsers] = useState(undefined)

    useEffect(() => {
        async function fetchUsers() {
            const { data } = await apollo.query({
                query: GET_USERS,
            })
            const res = data?.getUsers?.filter((o) => o.id != me.id)
            setUsers(res)
            setFilteredUsers(res)
        }

        fetchUsers()
    }, [])

    useEffect(() => {
        if (!!searchTerm && !!users) {
            const filtered = users.filter((u) =>
                u.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredUsers(filtered)
        } else {
            setFilteredUsers(users)
        }
    }, [searchTerm])

    if (!filteredUsers || !users) {
        return null
    }

    return (
        <div className="p-8 w-full">
            {filteredUsers?.map((user) => (
                <div
                    key={user.id}
                    className="flex flex-row justify-between items-start w-full my-8"
                >
                    <div className="flex flex-row items-start">
                        <Image
                            src={
                                user.avatar ||
                                'https://pbs.twimg.com/profile_images/1622015225573646336/jIHb2Pbs_400x400.jpg'
                            }
                            width={60}
                            height={60}
                            className="rounded-full"
                            alt="avatar"
                        />

                        <div className="flex flex-col ml-4 justify-start">
                            <div className="font-medium text-lg text-black">
                                {user.name}
                            </div>
                            <div
                                className={`text-neutral-500 text-sm font-medium`}
                                key={user.id}
                            >
                                {user.price} SUI
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <button
                            onClick={() => mint(user)}
                            className="bg-gradient-to-b from-emerald-400 to-emerald-500 w-20 h-8 rounded-full text-white"
                        >
                            Mint
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
