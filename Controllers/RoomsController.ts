import { Controller, Event, Body, Middleware } from '@Typetron/Router'
import { MessageForm } from 'App/Forms/MessageForm'
import { Room as RoomModel } from 'App/Models/Room'
import { Message as MessageModel } from 'App/Models/Message'
import { Room } from 'App/Entities/Room'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { SearchResult } from 'App/Models/SearchResults'
import { RoomForm } from 'App/Forms/RoomForm'
import { Storage, fromBase64 } from '@Typetron/Storage'
import { Inject } from '@Typetron/Container'
import { WebSocket } from '@Typetron/Router/Websockets'
import { WebsocketsProvider } from '../../typetron/Framework/Providers/WebsocketsProvider'

@Controller('rooms')
@Middleware(AuthMiddleware)
export class RoomsController {

    @AuthUser()
    user: User

    @Inject()
    socket: WebSocket

    @Inject()
    webSocketsProvider: WebsocketsProvider

    @Event()
    async browse() {
        await this.user.load('rooms.users', 'rooms.messages')
        return RoomModel.from(this.user.rooms)
    }

    @Event()
    async messages(room: Room) {
        await room.load('messages.user')
        this.socket.send(`rooms.${room.id}.messages`, MessageModel.from(room.messages))
    }

    @Event()
    async message(room: Room, form: MessageForm) {
        const message = await room.messages.save({
            content: form.content,
            user: this.user
        })
        this.socket.publishAndSend(`rooms.${room.id}`, `rooms.${room.id}.message`, MessageModel.from(message))
    }

    @Event()
    async usersToInvite(room: Room, @Body() search: string) {
        const users = await User
            .whereLike('name', `%${search}%`)
            .where('id', '!=', this.user.id)
            .andWhereNotIn('id', (await room.users.get()).pluck('id'))
            .get()

        return SearchResult.from(users)
    }

    @Event()
    async open1To1(@Body() userId: number) {
        let room = await Room.with(['users', query => query.whereIn('userId', [userId, this.user.id])])
            .where('type', 'personal')
            .first()

        if (room?.users.length !== 2) {
            room = await Room.create({
                type: 'personal'
            })

            await room.users.add(userId, this.user.id)
            await room.load('users')

            this.socket.subscribe(`rooms.${room.id}`)
        }

        this.socket.publish(`users.${userId}`, 'rooms.join', RoomModel.from(room))

        this.webSocketsProvider.sockets.get(userId)?.subscribe(`rooms.${room.id}`)

        return RoomModel.from(room)
    }

    @Event()
    async join(room: Room) {
        await room.users.syncWithoutDetaching(this.user.id)
        await room.load('messages.user', 'users')

        return RoomModel.from(room)
    }

    @Event()
    async update(room: Room, form: RoomForm, storage: Storage) {
        room.fill(form)
        if (form.avatar) {
            const image = fromBase64(form.avatar)
            const file = await storage.put(`public/avatars/room-${room.id}.${image.extension}`, image.content)
            room.avatar = file.name
        }
        await room.save()
        return RoomModel.from(room)
    }

    @Event()
    async add(form: RoomForm) {
        const room = await Room.create(form)
        await this.user.rooms.add(room)
        return RoomModel.from(room)
    }

    @Event()
    async remove(room: Room) {
        await room.delete()
    }

}
