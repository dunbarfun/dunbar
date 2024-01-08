// @ts-nocheck
import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { DepositSheet } from './profile'
import Sheet from 'react-modal-sheet'
import useStore from '@/stores'
import noChats from '../../public/empty.json'
import Button from '@/components/Button'
import { LuSearch } from 'react-icons/lu'
import { useRouter } from 'next/router'
import { StreamChat } from 'stream-chat'
import { useChatClient } from '@/hooks/useChatClient'
import useUpdateUser from '@/hooks/useUpdateUser'
import Loading from '@/components/Loading'
// import Lottie from 'lottie-react'
import _ from 'lodash'
import { gql, apollo, useQuery } from '@/lib/apollo'

const MIST_PER_SUI = 1_000_000_000;

export default function Chats() {
    return (
        <div className="flex-1 w-full ">
            <div className="top-0 w-full items-center justify-between p-8 flex h-24">
                <h1 className="text-3xl font-semibold">Chats</h1>
                <CreditsPill />
            </div>
            <ChatList />
        </div>
    )
}

export function SellSheet({ user, close }) {
  const [selling, setSelling] = useState(false)
    const me = useStore((state) => state.user.user)
    const updateUser = useUpdateUser()
    const [sellPrice, setSellPrice] = useState(null)

    const userId = user?.id
    useEffect(() => {
      const main = async () => {
        const res = await apollo.query({
          query: gql`query GetUserPrices($userId: String!) {
            getUserPrices(userId: $userId) {
              success
              buyPrice
              sellPrice
              shares
            }
          }`,
          variables: {
            userId: userId
          }
        })
        setSellPrice(res.data.getUserPrices.sellPrice)
      }
      if (userId != null) {
        main()
      }
    }, [userId])

    async function sell() {
      setSelling(true)
      const res = await apollo.mutate({
        mutation: gql`mutation SellSeed($ofUserId: String!) {
          sellSeed(ofUserId: $ofUserId) {
            success
          }
        }`,
        variables: {
          ofUserId: userId
        }
      })
      setSelling(false)
      alert(`🌱 Sold ${user?.name}'s seed`)
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
                    Sell <span className="text-emerald-500">{user.name}'s</span>{' '}
                    seed for {sellPrice / MIST_PER_SUI} SUI
                </h1>
                <h1 className="text-base text-neutral-500 font-medium mt-2"></h1>
                <Button
                    onClick={sell}
                  disabled={selling}
                    className="text-xl w-4/5 mt-4 mb-4 bg-gradient-to-b from-emerald-400 to-emerald-500"
                >
                    Confirm Sell
                </Button>
            </Sheet.Content>
        </Sheet.Container>
    )
}

function ChatList() {
    const users = []
    const router = useRouter()
    const user = useStore((state) => state.user.user)
    const [myChannels, setMyChannels] = useState([])
    const [loading, setLoading] = useState(true)
    const streamToken = useStore((state) => state.user.streamToken)

    useEffect(() => {
        async function fetchChannels() {
            const client = StreamChat.getInstance('a3z79643vs7g')

            await client.connectUser(
                {
                    id: user.id,
                    name: user.name,
                },
                streamToken
            )
            const filter = { type: 'messaging', members: { $in: [user.id] } }
            const sort = [{ last_message_at: -1 }]
            // @ts-ignore
            const channels = await client.queryChannels(filter, sort, {
                watch: true, // this is the default
                state: true,
                message_limit: 5,
            })
            // @ts-ignore
            setMyChannels(channels)
            setLoading(false)
        }

        if (!streamToken) {
            return
        }
        fetchChannels()
    }, [streamToken, user])

    const snapPoints = useMemo(() => [0.5], [])
    const [isOpen, setIsOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    if (loading) {
        return <Loading />
    }

    const channels = myChannels.map((c) => {
      let user = c?.data?.ofUser
      return {
        // @ts-ignore
        id: c.id,
        name: user?.name,
        avatar: user?.avatar,
        isUnread: c?.state?.unreadCount > 0,
        lastMessage:
            _.orderBy(
                c?.state?.messageSets[0]?.messages,
                (m) => m.updated_at,
                'desc'
            )[0]?.text || 'Send a message',
      }
    })

    return (
        <div className="p-8 w-full flex flex-col items-between">
            <Sheet
              snapPoints={snapPoints}
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
            >
                <SellSheet close={() => setIsOpen(false)} user={selectedUser} />
                <Sheet.Backdrop onTap={() => setIsOpen(false)} />
            </Sheet>

            {!channels || channels.length == 0 ? (
                <div className="flex flex-col items-center mt-40">
                  {/*
                    <Lottie
                        className="w-20 h-20 mb-4"
                        animationData={noChats}
                    />
                    */}
                    <h1 className="text-xl font-medium">No Chats Found</h1>
                    <h2 className="text-neutral-500 text-lg font-medium">
                        Mint someone's seed to start a chat
                    </h2>
                    <Button
                        onClick={() => router.push('/discover')}
                        className="mt-8 w-full"
                    >
                        Discover Users
                    </Button>
                </div>
            ) : (
                channels.map((channel) => (
                  <Link key={channel.id} href={`/chat/${channel.id}`}>
                        <div className="flex flex-row justify-between items-center my-4">
                            <div className="flex flex-row items-start">
                                <Image
                                    src={channel.avatar || '/tree.png'}
                                    width={60}
                                    height={60}
                                    className="rounded-full"
                                    alt="avatar"
                                />

                                <div className="flex flex-col ml-4 justify-start">
                                    <div className="font-medium text-lg">
                                        {channel.name}
                                    </div>
                                    <div
                                        className={`${classNames({
                                            'text-neutral-600 font-light':
                                                !channel.isUnread,
                                            'text-black font-medium':
                                                channel.isUnread,
                                        })}`}
                                        key={user.id}
                                    >
                                        {channel.lastMessage}
                                    </div>
                                </div>
                            </div>
                            {channel.isUnread && (
                                <div className="bg-emerald-400 h-4 w-4 rounded-full self-center justify-end" />
                            )}
                          <Button
                            className="bg-gradient-to-b from-emerald-400 to-emerald-500 rounded-full h-10 w-20 flex flex-row justify-center items-center"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              console.log(channel)
                              setSelectedUser(channel)
                              setIsOpen(true)
                            }}
                          >
                            Sell
                          </Button>
                        </div>
                    </Link>
                ))
            )}
        </div>
    )
}

function CreditsPill() {
    const [isOpen, setOpen] = useState(false)
    const me = useStore((state) => state.user.user)
    const snapPoints = useMemo(() => [0.5], [])
    return (
        <Fragment>
            <Sheet
                snapPoints={snapPoints}
                isOpen={isOpen}
                onClose={() => setOpen(false)}
            >
                <DepositSheet />
                <Sheet.Backdrop onTap={() => setOpen(false)} />
            </Sheet>
            <div
                onClick={() => setOpen(true)}
                className="bg-gradient-to-b from-emerald-400 to-emerald-500 rounded-full h-10 flex flex-row justify-center items-center px-4"
            >
                <Image
                    src="/sui.svg"
                    className="mr-1.5"
                    width={14}
                    height={14}
                    alt="sui"
                />
                <p className="text-white font-medium">{me?.wallet?.balance.toFixed(4)}</p>
            </div>
        </Fragment>
    )
}
