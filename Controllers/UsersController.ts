import { Controller, Event, Middleware } from '@Typetron/Router'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { User as UserModel } from 'App/Models/User'
import { UserForm } from 'App/Forms/UserForm'
import { Storage, fromBase64 } from '@Typetron/Storage'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'

@Controller('users')
@Middleware(AuthMiddleware)
export class UsersController {

    @AuthUser()
    user: User

    @Event()
    async update(form: UserForm, storage: Storage) {
        this.user.fill(form)
        if (form.avatar) {
            const image = fromBase64(form.avatar)
            const file = await storage.put(`public/avatars/user-${this.user.id}${Math.random()}.${image.extension}`, image.content)
            this.user.avatar = file.name
        }
        await this.user.save()
        return UserModel.from(this.user)
    }
}

