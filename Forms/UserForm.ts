import { Field, Form, Rules } from '@Typetron/Forms'
import { MinLength, Optional } from '@Typetron/Validation'
import type { User as UserEntity } from '../Entities/User'

export class UserForm extends Form {

    @Field()
    @Rules(Optional, MinLength(10))
    name?: string

    @Field()
    avatar?: string

    @Field()
    status?: UserEntity['status']
}
