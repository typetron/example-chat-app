import React from 'react'
import { serverAvatar, avatarStyle } from '../../utils'
import { User } from '../../../../Models/User'
import { Room } from '../../../../Models/Room'

interface RoomInfo {
    status?: string
    avatar?: string
    name: string
}

export const ChatRoom = ({user, room}: {user: User, room: Room, hasNewMessages?: boolean}) => {

    function participant() {
        return room.users.find(item => item.id !== user.id)
    }

    function info(): RoomInfo {
        if (room.type === 'personal') {
            return {
                status: participant().status,
                avatar: participant().avatar,
                name: participant().name
            }
        }
        return {
            status: undefined,
            avatar: room.avatar,
            name: room.name ?? ''
        }
    }

    const lastMessage = room.messages[0]?.content

    return <>
        {info().status ? <span className={'contact-status ' + info().status}/> : undefined}
        <span style={avatarStyle(serverAvatar(info().avatar))} className="avatar small"/>
        <div className="meta">
            <p className="name">{info().name}</p>
            <p className="preview">
                <i>{lastMessage?.length > 38 ? lastMessage.substring(0, 35) + '...' : lastMessage}</i></p>
        </div>
        <span className="new-messages-badge"/>
    </>
}
