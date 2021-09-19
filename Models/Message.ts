import { Field, Model } from '@Typetron/Models'
import { User } from 'App/Models/User'

export class Message extends Model {
    @Field()
    id: number

    @Field()
    content: string

    @Field()
    date: string

    @Field()
    user: User
}
