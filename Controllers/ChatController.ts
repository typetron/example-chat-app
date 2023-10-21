import { Action, Body, Controller, Middleware } from '@Typetron/Router'
import { Room } from 'App/Entities/Room'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { SearchResults } from 'App/Models/SearchResults'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'

@Controller()
export class ChatController {
    @Action()
    @Middleware(AuthMiddleware)
    async searchContacts(@Body() search = '', @AuthUser() user: User) {
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

