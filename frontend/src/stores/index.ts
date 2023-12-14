import { create } from 'zustand'
import type { SetState, GetState } from 'zustand'

import user, { UserStore } from '@/stores/users'

export * from '@/stores/users'

export type Store = UserStore

export default create<Store>((set: SetState<Store>, get: GetState<Store>) => ({
    ...user(set),
}))
