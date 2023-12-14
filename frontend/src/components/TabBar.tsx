// @ts-nocheck
import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function TabBar() {
    const router = useRouter()
    const pathName = router.pathname
    return (
        <div className="bottom-0 fixed h-20 w-full bg-white flex flex-row items-center justify-between px-20">
            <Link href="/chats">
                <TabButton
                    isActive={pathName === '/chats'}
                    src={
                        pathName === '/chats'
                            ? `/icons/heart-1.svg`
                            : `/icons/heart-0.svg`
                    }
                    title="Chats"
                />
            </Link>
            <Link href="/discover">
                <TabButton
                    isActive={pathName === '/discover'}
                    src={
                        pathName === '/discover'
                            ? `/icons/compass-1.svg`
                            : `/icons/compass-0.svg`
                    }
                    title="Discover"
                />
            </Link>
            <Link href="/profile">
                <TabButton
                    isActive={pathName === '/profile'}
                    src={
                        pathName === '/profile'
                            ? `/icons/people-1.svg`
                            : `/icons/people-0.svg`
                    }
                    title="Profile"
                />
            </Link>
        </div>
    )
}

function TabButton({ src, title, isActive = false }) {
    return (
        <div className="flex items-center justify-center flex-col">
            <Image src={src} alt={title} height={32} width={32} />
            <p
                className={`font-medium text-sm ${classNames({
                    'text-neutral-400': !isActive,
                    'text-neutral-800': isActive,
                })}`}
            >
                {title}
            </p>
        </div>
    )
}
