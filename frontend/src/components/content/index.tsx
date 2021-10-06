import React, { ChangeEvent, KeyboardEvent, useState, useEffect, createRef } from 'react'
import './style.scss'
import { Message } from '../../../../Models/Message'
import { Room } from '../../../../Models/Room'
import { User } from '../../../../Models/User'
import { SearchResult } from '../../../../Models/SearchResults'
import { serverAvatar, avatarStyle } from '../../utils'
import { SearchResultItem } from '../searchResultItem'
import { socket } from '../../socket'
import { Modal } from '../modal'
import { RoomForm } from '../types'
import { RoomFormModal } from '../roomForm'

interface Props {
    room: Room
    messages: Message[],
    authUser: User,
    onRoomDelete: (id: number) => void,
    onRoomUpdate: (id: number, form: RoomForm) => void
}

const messagesEndRef = createRef<HTMLDivElement>()
const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
}

export const Content = (props: Props) => {

    const [message, setMessage] = useState('')
    const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)
    const [showMembersModal, setShowMembersModal] = useState<boolean>(false)
    const [searchForMember, setSearchForMember] = useState<string>('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])

    useEffect(() => {
        socket.emit('rooms.messages', {
            parameters: [props.room.id],
        })

        scrollToBottom()
    }, [props.room])

    useEffect(() => {
        scrollToBottom()
    }, [props.messages])

    function participant() {
        return props.room.users.find(user => user.id !== props.authUser.id)
    }

    const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            await addMessage()
        }
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value)
    }

    const addMessage = async () => {
        if (!message) {
            return
        }

        socket.emit<Message>('rooms.message', {
            parameters: [props.room.id],
            body: {
                content: message
            }
        })

        setMessage('')
        scrollToBottom()
    }

    const updateRoom = async (id: number, form: RoomForm) => {
        await props.onRoomUpdate(id, form)
        setShowSettingsModal(false)
    }

    const inviteUser = async (userId: number) => {
        await socket.request('room.users.invite', {parameters: [props.room.id, userId], body: userId})
        setSearchResults(searchResults.filter(result => result.id === userId))
        await handleSearch(searchForMember)
        socket.emit('rooms.browse')
    }

    const removeUser = async (userId: number) => {
        await socket.request('room.users.remove', {parameters: [props.room.id, userId], body: userId})
        socket.emit('rooms.browse')
    }

    const handleSearch = async (search: string) => {
        setSearchForMember(search)

        if (search) {
            setSearchResults(await socket.request<SearchResult[]>('rooms.usersToInvite', {
                parameters: [props.room.id],
                body: search
            }))
        } else {
            setSearchResults([])
        }
    }

    function renderIcons() {
        return <>
            <i className="fa fa-pencil-alt room-icon clickable" aria-hidden="true" onClick={() => setShowSettingsModal(true)}/>
            <i className="fa fa-users room-icon clickable" aria-hidden="true" onClick={() => setShowMembersModal(true)}/>
            <i className="fa fa-trash room-icon clickable" aria-hidden="true" onClick={() => props.onRoomDelete(props.room.id)}/>
        </>
    }

    function renderMembersModal() {
        return <Modal
            okButton="OK"
            title="Members"
            visible={showMembersModal}
            onCancel={() => setShowMembersModal(false)}
            onOk={() => {}}
        >

            <div className="form-group">
                <label htmlFor=""><i className="fa fa-search" aria-hidden="true"/></label>
                <input type="text" value={searchForMember} placeholder="Search contacts..." onChange={(event) => handleSearch(event.target.value)}/>
            </div>
            <div id="contacts">
                <ul>
                    {
                        searchForMember
                            ? searchResults
                                .map((searchResult) =>
                                    <div className="member-to-invite" key={searchResult.id}>
                                        <SearchResultItem  {...searchResult} onClick={() => {
                                            setSearchForMember('')
                                        }}/>
                                        {props.room.users.find(user => user.id !== searchResult.id)
                                            ? <button onClick={() => inviteUser(searchResult.id)}>Invite</button>
                                            : undefined
                                        }
                                    </div>
                                )
                            : props.room.users.map(user =>
                                <div className="member-to-invite" key={user.id}>
                                    <SearchResultItem  {...user} onClick={() => {
                                        setSearchForMember('')
                                    }}/>
                                    <button onClick={() => removeUser(user.id)}>Remove</button>
                                </div>
                            )
                    }
                </ul>
            </div>
        </Modal>
    }

    return <>
        <div className="contact-profile">
            <div className="contact-profile-details">
                <div style={avatarStyle(serverAvatar(props.room.type === 'personal' ? participant()?.avatar : props.room.avatar))} className="avatar small"/>
                <p>{props.room.name || participant()?.name}</p>
                {
                    props.room.type !== 'personal' && renderIcons()
                }

            </div>
        </div>
        <div className="messages">
            <ul>
                {
                    props.messages.map((item, index) =>
                        <li className={props.authUser.id !== item.user?.id ? 'replies' : 'sent'} key={index}>
                            <div style={avatarStyle(serverAvatar(item.user?.avatar))} className={'avatar small'}/>
                            <span className="message-content">
                                    <div>{props.authUser.id === item.user?.id ? props.authUser.name : item.user?.name}
                                        &nbsp;&nbsp;&nbsp;
                                        <i>{new Date(item.date).toLocaleString('en-GB')}</i>
                                    </div>
                                    <p>{item.content}</p>
                                </span>
                        </li>
                    )
                }
            </ul>
            <div ref={messagesEndRef}/>
        </div>
        <div className="message-input">
            <input type="text" placeholder="Write your message..." value={message} onChange={handleChange} onKeyDown={handleKeyDown}/>
            <button className="submit" onClick={addMessage}>
                <i className="fa fa-paper-plane" aria-hidden="true"/>
            </button>
        </div>
        {props.room.type !== 'personal'
            ? <>
                <RoomFormModal visible={showSettingsModal}
                               onCancel={() => setShowSettingsModal(false)}
                               onOk={() => {}}
                               room={props.room}
                               onSubmit={form => updateRoom(props.room.id, form)}
                />
                {renderMembersModal()}
            </>
            : undefined}
    </>

}
