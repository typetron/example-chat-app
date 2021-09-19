import { Field, Model, FieldMany } from '@Typetron/Models'
import { User } from 'App/Models/User'
import { Message } from 'App/Models/Message'

export class Room extends Model {
    @Field()
    id: number

    @Field()
    name: string

    @Field()
    avatar?: string

    @Field()
    type: 'personal' | 'private' | 'public'

    @FieldMany(User)
    users: User[]

    @FieldMany(Message)
    messages: Message[]
}
