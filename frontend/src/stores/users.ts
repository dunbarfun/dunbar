import { produce } from 'immer'

import type { SetState } from 'zustand'
import type { Store } from '@/stores'

import storage from '@/lib/storage'
import supabase from '@/lib/supabase'
export interface UserStore {
    user: {
        user: any
        setUser: (user: any) => void
        seenWelcome: boolean
        setSeenWelcome: (seen: boolean) => void
        token: any
        setToken: (token: any) => void
        streamToken: any
        setStreamToken: (token: any) => void
        clear: () => void
    }
}

export default (set: SetState<Store>): UserStore => ({
    user: {
        user: storage.get('user'),
        setUser: (user) => {
            set(
                produce((state) => {
                    state.user.user = user
                })
            )
        },
        token: storage.get('token'),
        setToken: (token) => {
            set(
                produce((state) => {
                    storage.set('token', token)
                    state.user.token = token
                })
            )
        },
        streamToken: storage.get('streamToken'),
        setStreamToken: (token) => {
            set(
                produce((state) => {
                    storage.set('streamToken', token)
                    state.user.streamToken = token
                })
            )
        },
        clear: () => {
            set(
                produce((state) => {
                    storage.del('token')
                    storage.del('user')
                    storage.del('streamToken')
                    supabase.auth.signOut()
                    state.user.user = null
                })
            )
        },
        seenWelcome: storage.get('seenWelcome'),
        setSeenWelcome: (seen) => {
            set(
                produce((state) => {
                    storage.set('seenWelcome', seen)
                    state.user.seenWelcome = seen
                })
            )
        },
    },
})
