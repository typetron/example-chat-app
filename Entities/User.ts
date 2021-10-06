import { Column, Options, HasMany, Relation, BelongsToMany } from '@Typetron/Database'
import { User as Authenticatable } from '@Typetron/Framework/Auth'
import { User as UserModel } from 'App/Models/User'
import { Message } from 'App/Entities/Message'
import { Room } from 'App/Entities/Room'

@Options({
    table: 'users'
})
export class User extends Authenticatable {
    @Column()
    name: string

    @Column()
    avatar: string

    @Relation(() => Message, 'user')
    messages: HasMany<Message>

    @Relation(() => Room, 'users')
    rooms: BelongsToMany<Room>

    @Column()
    status: UserModel['status']
}
