import { TestCase } from '../TestCase'
import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { User } from 'App/Models/User'

@suite
export class UsersControllerTest extends TestCase {

    @test
    async updatesUser() {
        const user = await this.createUser()
        await this.actingAs(user)
        const response = await this.action<User>('users.update', {
            body: {
                status: 'offline'
            }
        })
        expect(response.body.status).to.be.equal('offline')
    }

}
