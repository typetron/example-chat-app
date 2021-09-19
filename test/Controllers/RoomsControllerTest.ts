import { TestCase } from '../TestCase'
import { suite, test } from '@testdeck/mocha'
import { expect } from 'chai'
import { Room } from 'App/Entities/Room'
import { Room as RoomModel } from 'App/Models/Room'
import { Message } from 'App/Models/Message'
import { User } from 'App/Entities/User'
import { SearchResult } from 'App/Models/SearchResults'
import { RoomForm } from 'App/Forms/RoomForm'

@suite
export class RoomsControllerTest extends TestCase {
    private user: User

    async before() {
        await super.before()
        this.user = await this.createUser()
        await this.actingAs(this.user)
    }

    @test
    async sendsMessage() {
        const room = await Room.create()

        this.on<Message>(`rooms.${room.id}.message`, response => {
            expect(response.content).to.be.equal('content')
        })

        await this.event('rooms.message', {
            parameters: [room.id],
            body: {
                content: 'content'
            }
        })
    }

    @test
    async invitesUserToRoom() {
        const room = await Room.create()
        const someOtherUser = await this.createUser()
        await this.event('room.users.invite', {
            parameters: [room.id],
            body: someOtherUser.id
        })

        const sameRoom = await Room.findOrFail(room.id)
        await sameRoom.load('users')
        expect(sameRoom.users.length).to.be.equal(1)
    }

    @test
    async removesUserFromRoom() {
        const room = await Room.create()
        const someOtherUser = await this.createUser()
        await room.users.add(someOtherUser)
        expect(room.users.length).to.be.equal(1)
        await this.event('room.users.remove', {
            parameters: [room.id],
            body: someOtherUser.id
        })

        const sameRoom = await Room.findOrFail(room.id)
        await sameRoom.load('users')
        expect(sameRoom.users.length).to.be.equal(0)
    }

    @test
    async browseUserRooms() {
        const room1 = await Room.create()
        const room2 = await Room.create()
        await this.user.rooms.add(room1, room2)

        const response = await this.event<RoomModel[]>('rooms.browse')

        expect(response.body.length).to.be.equal(2)
    }

    @test
    async getsRoomMessages() {
        const room = await Room.create()

        await room.messages.save({
            user: this.user,
            content: 'content'
        })

        this.on<Message[]>(`room.${room.id}.messages`, response => {
            expect(response.length).to.be.equal(1)
            expect(response[0].content).to.be.equal('content')
        })

        await this.event('rooms.messages', {
            parameters: [room.id]
        })
    }

    @test
    async createsRoom() {
        const response = await this.event<RoomModel>('rooms.add', {
            body: {
                name: 'new room'
            }
        })

        expect(response.body.name).to.be.equal('new room')

        const room = await Room.findOrFail(response.body.id)
        await room.load('users')

        expect(room).to.be.instanceOf(Room)
        expect(room.users.length).to.be.equal(1)
        expect(room.users[0].id).to.be.equal(this.user.id)
    }

    @test
    async removesRoom() {
        const room = await Room.create()

        await this.event('rooms.remove', {
            parameters: [room.id]
        })

        expect(await Room.find(room.id)).to.be.equal(undefined)
    }

    @test
    async searchForUsersToInviteInARoom() {
        const userAlreadyInRom = await this.createUser({
            name: 'Mark'
        })
        const userNotInRom = await this.createUser({
            name: 'John'
        })
        const room = await Room.create()
        await room.users.add(userAlreadyInRom)

        const r = await Room.findOrFail(room.id)
        await r.load('users')

        const response = await this.event<SearchResult[]>('rooms.usersToInvite', {
            parameters: [room.id],
            body: userNotInRom.name
        })

        expect(response.body.length).to.be.equal(1)
        expect(response.body[0].name).to.be.equal(userNotInRom.name)
    }

    @test
    async openAn1On1Room() {
        const friend = await this.createUser({name: 'John'})

        const response = await this.event<RoomModel>('rooms.open1To1', {
            body: friend.id
        })

        expect(response.body.type).to.be.equal('personal')
        expect(response.body.users.length).to.be.equal(2)
    }

    @test
    async joinsRoom() {
        const room = await Room.create()

        const response = await this.event<RoomModel>('rooms.join', {
            parameters: [room.id],
        })

        expect(response.body.id).to.be.equal(room.id)
        expect(response.body.users.length).to.be.equal(1)
        expect(response.body.users[0].name).to.be.equal(this.user.name)
    }

    @test
    async updatesRoom() {
        const room = await Room.create()

        const response = await this.event<RoomModel>('rooms.update', {
            parameters: [room.id],
            body: {
                name: 'test room'
            } as RoomForm
        })

        expect(response.body.name).to.be.equal('test room')
    }

}
