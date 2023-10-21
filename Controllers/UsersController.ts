import { Action, Controller, Middleware } from '@Typetron/Router'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { User as UserModel } from 'App/Models/User'
import { UserForm } from 'App/Forms/UserForm'
import { fromBase64, Storage } from '@Typetron/Storage'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { Inject } from '@Typetron/Container'
import { WebSocket } from '@Typetron/Router/Websockets'
import { Notifier } from 'App/Services/Notifier'

@Controller('users')
@Middleware(AuthMiddleware)
export class UsersController {

    @AuthUser()
    user: User

    @Inject()
    socket: WebSocket

    @Inject()
    notifier: Notifier

    @Action()
    async update(form: UserForm, storage: Storage) {
        this.user.fill(form)
        if (form.avatar) {
            const image = fromBase64(form.avatar)
            const file = await storage.put(`public/avatars/user-${this.user.id}${Math.random()}.${image.extension}`, image.content)
            this.user.avatar = file.name
        }
        await this.user.save()

        await this.notifier.notifyRooms(this.user)

        return UserModel.from(this.user)
    }
}

