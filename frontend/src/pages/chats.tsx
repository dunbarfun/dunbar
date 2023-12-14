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
import Loading from '@/components/Loading'
import Lottie from 'lottie-react'
import _ from 'lodash'

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

    if (loading) {
        return <Loading />
    }

    const channels = myChannels.map((c) => ({
      // @ts-ignore
        id: c.id,
        name:
            c?.data?.byUser?.id === user?.id
                ? c?.data?.ofUser?.name
                : c?.data?.byUser?.name,
        avatar:
            c?.data?.byUser?.id === user?.id
                ? c?.data?.ofUser?.avatar
                : c?.data?.byUser?.avatar,
        isUnread: c?.state?.unreadCount > 0,
        lastMessage:
            _.orderBy(
                c?.state?.messageSets[0]?.messages,
                (m) => m.updated_at,
                'desc'
            )[0]?.text || 'Send a message',
    }))

    return (
        <div className="p-8 w-full flex flex-col items-between">
            {!channels || channels.length == 0 ? (
                <div className="flex flex-col items-center mt-40">
                    <Lottie
                        className="w-20 h-20 mb-4"
                        animationData={noChats}
                    />
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
                        <div className="flex flex-row justify-between items-start my-4">
                            <div className="flex flex-row items-start">
                                <Image
                                    src={channel.avatar}
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
                className="bg-gradient-to-b from-emerald-400 to-emerald-500 rounded-full h-10 w-20 flex flex-row justify-center items-center"
            >
                <Image
                    src="/sui.svg"
                    className="mr-1.5"
                    width={14}
                    height={14}
                    alt="sui"
                />
                <p className="text-white font-medium">{me?.wallet?.balance}</p>
            </div>
        </Fragment>
    )
}
