import { useEffect, useState } from 'react'
import { users } from '@/mock/users'
import { StreamChat, User } from 'stream-chat'
import {
    Chat,
    Channel,
    ChannelHeader,
    MessageInput,
    MessageList,
    Thread,
    Window,
} from 'stream-chat-react'
import { useRouter } from 'next/router'
import useUser from '@/selectors/useUser'
import useStore from '@/stores'
import { useChatClient } from '@/hooks/useChatClient'

import 'stream-chat-react/dist/css/v2/index.css'

const apiKey = 'a3z79643vs7g'
const chatClient = StreamChat.getInstance(apiKey)

export default function ChatScreen() {
    const router = useRouter()
    const channelId = router.query.chatId as string
    const [channel, setChannel] = useState(null)

    const [loading, setLoading] = useState(true)
    const user = useUser()
    const streamToken = useStore((state) => state.user.streamToken)

    useEffect(() => {
        const main = async () => {
            await chatClient.connectUser(
                {
                    id: user.id,
                    name: user.name,
                },
                streamToken
            )

            const channel = chatClient.channel('messaging', channelId)
            await channel.watch()
            console.log('cccc', channel)

            // @ts-ignore
            setChannel(channel)
            setLoading(false)
        }
        if (streamToken != null && user != null && channelId != null) {
            main()
        }
    }, [streamToken, user, channelId])

  if (loading || channel == null) {
    return
  }

    return (
        <div className="w-full h-full flex-col flex-1">
            <div className="top-0 absolute h-24 w-full"></div>
            <Chat client={chatClient} theme="str-chat__theme-light">
                <Channel channel={channel}>
                    <Window>
                        <ChannelHeader
                            // @ts-ignore
                            title={channel?.data?.ofUser.name}
                            // @ts-ignore
                            image={channel?.data?.ofUser?.avatar}
                        />
                        <MessageList />
                        <MessageInput />
                    </Window>
                    <Thread />
                </Channel>
            </Chat>
        </div>
    )
}
