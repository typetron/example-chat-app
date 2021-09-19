import { Field, Model } from '@Typetron/Models'
import type { User as UserEntity } from '../Entities/User'

export class User extends Model {
    @Field()
    id: number

    @Field()
    name: string

    @Field()
    avatar: string

    @Field()
    status: UserEntity['status']
}
