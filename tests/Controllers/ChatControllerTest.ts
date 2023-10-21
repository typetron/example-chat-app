import { TestCase } from '../TestCase'
import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { SearchResults } from 'App/Models/SearchResults'

@suite
export class ChatControllerTest extends TestCase {

    @test
    async searchesForContacts() {
        await this.actingAs(await this.createUser())
        const response = await this.action<SearchResults>('searchContacts')
        expect(response.body.users).to.be.an('array')
        expect(response.body.rooms).to.be.an('array')
    }

}
