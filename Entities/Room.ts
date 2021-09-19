import { Column, ID, PrimaryColumn, Relation, Entity, BelongsToMany, HasMany } from '@Typetron/Database'
import { User } from 'App/Entities/User'
import { Message } from 'App/Entities/Message'

export class Room extends Entity {

    @PrimaryColumn()
    id: ID

    @Column()
    name?: string

    @Relation(() => User, 'messages')
    users: BelongsToMany<User>

    @Relation(() => Message, 'room')
    messages: HasMany<Message>

    @Column()
    avatar: string

    @Column()
    type: 'personal' | 'private' | 'public'
}
