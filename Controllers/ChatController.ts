import { Controller, Event, Body, Middleware } from '@Typetron/Router'
import { Room } from 'App/Entities/Room'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { SearchResults } from 'App/Models/SearchResults'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'

/*
    + add route parameters on websockets so we can use Route-Entity binding in websockets endpoints
    + fix issue with loading websockets after server refresh (needs to be really smooth). It doesn't work anymore if the server is restarted
    + fix TODOs
    + use @Middleware(AuthMiddleware) (test it with a auth token expiration time of 10s)
    + separate controllers per entities
    + add "remove" user from room
    + add "user invite" to rooms used as groups
    + make the Websockets server to not start when running tests
    + find a way to not run the websockets in test or when run from the `typetron` command in CLI
    + add "create room" button
    + add "remove room" button
    + use a class to inject the Websocket instead of using @Inject('socket')
    + subscribe the "auth user" to each room as a topic with this format: 'room.{id}'
    + add decorators for @OnOpen and @OnClose websocket events
    + fix issue where the Request object is not correct if multiple WS requests are made
    - use Typetron forms in React
    - add unit tests
    - have better naming for events and subscriptions
    + check why we can't have multiple users logged in
    - try to find an easier way to save images through websockets
*/

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

