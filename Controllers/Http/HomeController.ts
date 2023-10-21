import { Controller, Get } from '@Typetron/Router'

@Controller()
export class ChatController {

    @Get()
    async home() {
        return 'Welcome to Typetron WebSockets server!'
    }
}

