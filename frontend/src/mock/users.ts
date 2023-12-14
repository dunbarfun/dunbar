type User = {
    id: string
    name: string
    username: string
    avatarUrl: string

    // Chat fields
    lastMessage?: string
    messageRead?: boolean

    // Search fields
    price?: number
    priceChangePercentage?: number
}

export const activity = [
    {
        id: '1',
        fromUser: {
            id: 'su',
            name: 'Su Zhu',
            avatarUrl:
                'https://pbs.twimg.com/profile_images/1690929913270792192/6n-PzBnB_400x400.jpg',
        },
        toUser: {
            id: 'cobie',
            name: 'Cobie',
            avatarUrl:
                'https://pbs.twimg.com/profile_images/1493627761856249856/N-hdB1DB_400x400.jpg',
        },
        type: 'minted',
        quantity: 4,
    },
]

export const users: User[] = [
    {
        id: '1',
        name: 'Hsaka',
        username: 'hsaka',
        avatarUrl:
            'https://pbs.twimg.com/profile_images/1690929913270792192/6n-PzBnB_400x400.jpg',
        lastMessage: 'Yoo what is going on?',
        messageRead: false,
        price: 1200,
    },
    {
        id: '2',
        name: 'Caroline',
        username: 'caroline',
        avatarUrl: 'https://pbs.twimg.com/media/FhaldKXVsAAFIPw.jpg:large',
        lastMessage: 'Hey got some alpha?',
        messageRead: true,
        price: 1400,
    },
    {
        id: '3',
        name: 'Alex Wice',
        username: 'awice',
        avatarUrl:
            'https://pbs.twimg.com/profile_images/1493627761856249856/N-hdB1DB_400x400.jpg',
        lastMessage: 'Wanna fuck some hoes?',
        messageRead: true,
        price: 1400,
    },
]
