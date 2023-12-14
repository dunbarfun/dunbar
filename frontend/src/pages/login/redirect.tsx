// @ts-nocheck
// User gets here after signing in.
import supabase from '@/lib/supabase'
import getUrl from '@/lib/url'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { apollo, gql } from '@/lib/apollo'
import useStore from '@/stores'
import useUpdateUser from '@/hooks/useUpdateUser'
import Loading from '@/components/Loading'

export default function LoginRedirect() {
    const router = useRouter()
    const token = useStore((state) => state.user.token)
    const setToken = useStore((state) => state.user.setToken)
    const setStreamToken = useStore((state) => state.user.setStreamToken)
    const updateUser = useUpdateUser()

    useEffect(() => {
        const main = async () => {
            const supabaseRes = await supabase.auth.getSession()

            const email = supabaseRes?.data?.session?.user?.email

            // Call /auth
            const { data } = await apollo.mutate({
                mutation: gql`
                    mutation auth(
                        $supabaseToken: String!
                        $provider: String
                        $email: String
                    ) {
                        auth(
                            supabaseToken: $supabaseToken
                            provider: $provider
                            email: $email
                        ) {
                            token
                            streamToken
                            user {
                                id
                                supabaseUserId
                                createdAt
                                updatedAt
                            }
                        }
                    }
                `,
                variables: {
                    supabaseToken: supabaseRes.data.session.access_token,
                    provider: 'web',
                    email,
                },
            })
            if (data.auth.token) {
                setToken(data.auth.token)
            }
            if (data.auth.streamToken) {
                setStreamToken(data.auth.streamToken)
            }
            await updateUser()

            if (data.auth.token) {
                router.push('/')
            }
        }
        main()
    }, [])

    return (
        <div className="bg-background-primary flex flex-col items-center justify-center min-h-screen item">
            <Loading />
        </div>
    )
}
