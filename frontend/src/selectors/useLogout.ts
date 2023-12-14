import useStore from '@/stores'

export default function useLogout() {
    const clear = useStore((state) => state.user.clear)
    return () => clear()
}
