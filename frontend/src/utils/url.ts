export const getUrl = () => {
    const currentDomain = window.location.hostname
    if (currentDomain === 'localhost') {
        const port = window.location.port
        return port ? `http://${currentDomain}:${port}` : currentDomain
    } else {
        return `https://${currentDomain}`
    }
}
