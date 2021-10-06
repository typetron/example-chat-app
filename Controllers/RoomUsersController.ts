import { Controller, Event, Body, Middleware } from '@Typetron/Router'
import { Room } from 'App/Entities/Room'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { Inject } from '@Typetron/Container'
import { WebsocketsProvider } from '@Typetron/Framework/Providers/WebsocketsProvider'

@Controller('room.users')
@Middleware(AuthMiddleware)
export class RoomUsersController {

    @AuthUser()
    user: User

    @Inject()
    websocketsProvider: WebsocketsProvider

    @Event()
    async invite(room: Room, @Body() user: number) {
        await room.users.add(user)
        const invitedUserSocket = this.websocketsProvider.sockets.get(user)
        invitedUserSocket?.subscribe(`rooms.${room.id}`)
        invitedUserSocket?.send('rooms.update')
    }

    @Event()
    async remove(room: Room, @Body() user: number) {
        await room.users.remove(user)
        const removedUserSocket = this.websocketsProvider.sockets.get(user)
        removedUserSocket?.unsubscribe(`rooms.${room.id}`)
        removedUserSocket?.send('rooms.update')
    }

}
