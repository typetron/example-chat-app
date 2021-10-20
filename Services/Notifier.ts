import { User } from 'App/Entities/User'
import { WebsocketsProvider } from '@Typetron/Framework/Providers/WebsocketsProvider'
import { Inject } from '@Typetron/Container'

export class Notifier {

    @Inject()
    websocketProvider: WebsocketsProvider

    async notifyRooms(user: User) {
        const onlineUsers = Array.from(this.websocketProvider.sockets.values()).pluck('id')
        await user.load([
            'rooms.users',
            query => query.whereIn('id', onlineUsers).andWhere('id', '!=', user.id)
        ])

        const onlineFriends = user.rooms.items.flatMap(room => room.users.items).unique('id').pluck('id')
        onlineFriends.forEach(friendId => {
            this.websocketProvider.sockets.get(friendId)?.send('rooms.update')
        })
    }

    notifyUsers(users: User[]) {
        const onlineUsers = Array.from(this.websocketProvider.sockets.values()).pluck('id')
        users.filter(user => onlineUsers.includes(user.id)).forEach(friendId => {
            this.websocketProvider.sockets.get(friendId.id)?.send('rooms.update')
        })
    }
}
