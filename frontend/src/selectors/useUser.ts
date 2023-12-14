import useStore from '@/stores'

export default function useUser() {
    return useStore((state) => state.user.user)
}
