import { apollo, gql } from '@/lib/apollo'
import storage from '@/lib/storage'
import useStore from '@/stores'

export default function useIsOnboarded() {
    const me = useStore((state) => state.user.user)
    return !!me.name && !!me.username && !!me.avatarUrl
}
