import { Field, Form, Rules } from '@Typetron/Forms'
import { Required } from '@Typetron/Validation'

export class RoomForm extends Form {

    @Field()
    @Rules(Required)
    name: string

    @Field()
    avatar?: string
}
