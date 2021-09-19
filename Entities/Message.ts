import { Column, ID, PrimaryColumn, CreatedAt, BelongsTo, Relation, Entity } from '@Typetron/Database'
import { User } from 'App/Entities/User'
import { Room } from './Room'

export class Message extends Entity {

    @PrimaryColumn()
    id: ID

    @Column()
    content: string

    @Relation(() => User, 'messages')
    user: BelongsTo<User>

    @Relation(() => Room, 'messages')
    room: BelongsTo<Room>

    @CreatedAt()
    date: Date
}
