export const truncateAddress = (address: string) => {
    return address.slice(0, 5) + '...' + address.slice(-3)
}

export const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
}
