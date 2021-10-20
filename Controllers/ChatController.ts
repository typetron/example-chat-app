import { Controller, Event, Body, Middleware, Get } from '@Typetron/Router'
import { Room } from 'App/Entities/Room'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { SearchResults } from 'App/Models/SearchResults'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'

@Controller()
export class ChatController {

    @Get()
    async home() {
        return 'Welcome to Typetron WebSockets server!'
    }

    @Event()
    @Middleware(AuthMiddleware)
    async searchContacts(@Body() search: string, @AuthUser() user: User) {
        const [users, rooms] = await Promise.all([
            User
                .whereLike('name', `%${search}%`)
                .where('id', '!=', user.id)
                .get(),
            Room
                .whereLike('name', `%${search}%`)
                .where('type', `public`)
                .get()
        ])
        return SearchResults.from({users, rooms})
    }
}

