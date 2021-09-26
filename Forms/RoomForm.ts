import { Field, Form, Rules } from '@Typetron/Forms'
import { Required } from '@Typetron/Validation'
import { Room } from 'App/Models/Room'

export class RoomForm extends Form {

    @Field()
    @Rules(Required)
    name: string

    @Field()
    avatar?: string

    @Field()
    type?: Room['type']
}
