import { Field, Form, Rules } from '@Typetron/Forms'
import { Required } from '@Typetron/Validation'

export class MessageForm extends Form {
    @Field()
    @Rules(Required)
    content: string
}
