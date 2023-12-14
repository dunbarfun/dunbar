import { gql } from '@apollo/client'

export const GET_USERS = gql`
    query GetUsers {
        getUsers {
            id
            avatar
            name
            username
            price
            wallet {
                id
                balance
                publicKey
            }
        }
    }
`

export const UPDATE_USER = gql`
    mutation UpdateUser($username: String, $name: String, $avatar: String) {
        updateUser(username: $username, name: $name, avatar: $avatar) {
            user {
                id
            }
        }
    }
`

export const MINT_SEED = gql`
    mutation MintSeed($ofUserId: String!, $amount: Int) {
        mintSeed(ofUserId: $ofUserId, amount: $amount) {
            success
        }
    }
`
