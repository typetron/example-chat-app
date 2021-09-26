import { Controller, Event, Body, Middleware } from '@Typetron/Router'
import { Room } from 'App/Entities/Room'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { SearchResults } from 'App/Models/SearchResults'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'

@Controller()
export class ChatController {

    @Event()
    @Middleware(AuthMiddleware)
    async searchContacts(@Body() search: string, @AuthUser() user: User) {
        const users = await User
            .whereLike('name', `%${search}%`)
            .where('id', '!=', user.id)
            .get()
        const rooms = await Room
            .whereLike('name', `%${search}%`)
            .where('type', `public`)
            .get()
        return SearchResults.from({
            users,
            rooms
        })
    }
}

