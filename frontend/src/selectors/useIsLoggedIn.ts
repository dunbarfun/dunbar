import useStore from '@/stores'

export default function useIsLoggedIn() {
    const user = useStore((state) => state.user.user)
    return useStore((state) => state.user.user != null)
}
