import React from 'react'
import Image from 'next/image'

export default function Loading() {
    return (
        <div className="flex flex-1 flex-col justify-center w-full items-center bg-background-primary h-full">
            <Image alt="logo" src="/logo.png" width={80} height={80} />
            <h2 className="font-medium text-xl mt-4">Loading tribe</h2>
        </div>
    )
}
