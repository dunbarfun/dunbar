import { apollo, gql } from '@/lib/apollo'
import storage from '@/lib/storage'
import useStore from '@/stores'

export const GET_ME_QUERY = gql`
    query Me {
        me {
            id
            createdAt
            updatedAt
            name
            username
            avatar
            wallet {
                id
                balance
                publicKey
            }
            transactions {
                id
                type
                priceSUI
                byUser {
                    id
                    name
                    avatar
                }
                ofUser {
                    id
                    name
                    avatar
                }
            }
        }
    }
`
export default function useUpdateUser() {
    const setUser = useStore((state) => state.user.setUser)

    return async () => {
        const { data } = await apollo.query({
            query: GET_ME_QUERY,
            fetchPolicy: 'network-only',
        })
        if (data.me == null) {
            return null
        }
        const user = data.me
        storage.set('user', user)
        setUser(user)
        return user
    }
}
