import { Controller, Event, Body, OnClose } from '@Typetron/Router'
import { RegisterForm } from 'App/Forms/RegisterForm'
import { User } from 'App/Entities/User'
import { User as UserModel } from 'App/Models/User'
import { LoginForm } from 'App/Forms/LoginForm'
import { Inject } from '@Typetron/Container'
import { Auth } from '@Typetron/Framework/Auth'
import { WebSocket } from '@Typetron/Router/Websockets'
import { WebsocketsProvider } from '@Typetron/Framework/Providers/WebsocketsProvider'

@Controller()
export class AuthController {

    @Inject()
    auth: Auth

    @Inject()
    socket: WebSocket

    @Inject()
    webSocketsProvider: WebsocketsProvider

    @Event()
    async register(form: RegisterForm) {
        const user = await User.where('email', form.email).first()
        if (user) {
            throw new Error('User already exists')
        }

        if (form.password !== form.passwordConfirmation) {
            throw new Error('Passwords don\'t match')
        }

        return UserModel.from(this.auth.register(form.email, form.password))
    }

    @Event()
    async login(form: LoginForm) {
        const token = await this.auth.login(form.email, form.password)
        const user = await this.auth.user<User>()
        await this.subscribeToGenericEvents(user)
        return {token, user}
    }

    @Event()
    async loginByToken(@Body() token: string) {
        await this.auth.verify(token)
        const user = await this.auth.user<User>()
        await this.subscribeToGenericEvents(user)
        return UserModel.from(user)
    }

    async subscribeToGenericEvents(user: User) {
        this.socket.subscribe(`users.${user.id}`)

        const rooms = await user.rooms.get()
        rooms.forEach(room => {
            this.socket.subscribe(`rooms.${room.id}`)
        })

        this.socket.id = user.id
        this.webSocketsProvider.sockets.set(this.socket.id, this.socket)
    }

    @OnClose
    onClose() {
        if (this.socket.id) {
            this.webSocketsProvider.sockets.delete(this.socket.id)
        }
    }
}
