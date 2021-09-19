import { TestCase as BaseTestCase } from '@Typetron/Testing/TestCase'
import { Application, AuthConfig } from '@Typetron/Framework'
import * as path from 'path'
import { Crypt } from '@Typetron/Encryption'
import { User } from 'App/Entities/User'
import * as dotenv from 'dotenv'

dotenv.config({path: 'test/.env'})

export class TestCase extends BaseTestCase {

    async bootstrapApp() {
        return await Application.create(path.join(__dirname, '..'))
    }

    async createUser(overrides: Partial<User> = {}) {
        const password = overrides.password ?? String.randomAlphaNum(10)
        delete overrides.password
        return await User.create({
            name: String.randomAlphaNum(10),
            email: `${String.randomAlphaNum(10)}@${String.randomAlphaNum(5)}.${String.randomAlphaNum(3)}`,
            password: await this.app.get(Crypt).hash(password, this.app.get(AuthConfig).saltRounds),
            ...overrides
        })
    }

}
