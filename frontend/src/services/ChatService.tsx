import useStore from '@/stores'
import { useEffect } from 'react'
import { StreamChat } from 'stream-chat'

export default function ChatService() {
    const streamToken = useStore((state) => state.user.streamToken)
    const user = useStore((state) => state.user.user)
    const client = StreamChat.getInstance('a3z79643vs7g')

    useEffect(() => {
        if (user.name && user.id && streamToken) {
            client.connectUser(
                {
                    id: user.id,
                    name: user.name,
                },
                streamToken
            )
        }
    }, [user, streamToken])

    return null
}
