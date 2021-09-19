import { Controller, Event, Body, Middleware } from '@Typetron/Router'
import { Room } from 'App/Entities/Room'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'

@Controller('room.users')
@Middleware(AuthMiddleware)
export class RoomsController {

    @AuthUser()
    user: User

    @Event()
    async invite(room: Room, @Body() user: number) {
        await room.users.add(user)
    }

    @Event()
    async remove(room: Room, @Body() user: number) {
        await room.users.remove(user)
    }

}
