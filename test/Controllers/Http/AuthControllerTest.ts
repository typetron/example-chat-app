import { suite, test } from '@testdeck/mocha'
import { Http } from '@Typetron/Router/Http'
import { expect } from 'chai'
import { TestCase } from '../../TestCase'
import { User } from 'App/Models/User'

@suite
class AuthControllerTest extends TestCase {

    @test
    async login() {
        const user = await this.createUser({password: 'password'})
        const response = await this.event('login', {
            body: {
                email: user.email,
                password: 'password'
            }
        })
        expect(response.status).to.be.equal(Http.Status.OK)
    }

    @test
    async register() {
        const response = await this.event<User>('register', {
            body: {
                email: 'user@test.com',
                password: 'password',
                passwordConfirmation: 'password',
            }
        })
        expect(response.status).to.be.equal(Http.Status.OK)
        expect(response.body.id).to.be.equal(1)
    }
}
