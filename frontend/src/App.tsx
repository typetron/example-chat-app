import React, { useState, useEffect, useCallback, ChangeEvent } from 'react'
import './App.scss'
import { User } from '../../Models/User'
import { socket } from './socket'
import { Room } from '../../Models/Room'
import { Message } from '../../Models/Message'
import { Login } from './components/login'
import { Register } from './components/register'
import { Content } from './components/content'
import { Sidebar } from './components/sidebar'
import { Modal } from './components/modal'
import { avatarStyle, serverAvatar, toBase64, displayErrors } from './utils'
import { EventResponse } from '@typetron/Websockets/types'
import { BackendError } from './models'

const App = () => {

    const [loading, setLoading] = useState<boolean>(true)
    const [authPage, setAuthPage] = useState<'login' | 'register'>('login')
    const [user, setUser] = useState<User | undefined>(undefined)
    const [rooms, setRooms] = useState<(Room & {hasNewMessages?: boolean})[]>([])
    const [selectedRoom, setSelectedRoom] = useState<number | undefined>(undefined)
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const [showCreateRoomModal, setShowCreateRoomModal] = useState(false)
    const [messagesMap, setMessagesMap] = useState<Record<number, Message[]>>({})
    const [roomForm, setRoomForm] = useState({
        name: '',
    })
    const [userForm, setUserForm] = useState<{name: string, avatar?: string}>({
        name: '',
        avatar: ''
    })

    const login = useCallback((value: User) => {
        setUser(value)
        socket.emit('rooms.browse')
    }, [])

    useEffect(() => {
        socket.onConnect(async () => {
            const token = localStorage.getItem('token')

            if (token) {
                try {
                    const response = await socket.request<User>('loginByToken', {body: token})
                    setUser(response)
                    setUserForm({name: response.name})
                    socket.emit('rooms.browse')
                } catch (error) {
                    localStorage.removeItem('token')
                    setUser(undefined)
                }
            }
            setLoading(false)
        })

        socket.on<Room[]>('rooms.browse').subscribe(response => {
            setRooms(response)
            setSelectedRoom(value => value ?? response[0]?.id)
        })

        socket.on<Room>('rooms.join').subscribe(room => {
            setRooms(value => {
                return [...value, room]
            })
        })

        socket.onError({except: ['loginByToken']}).subscribe((error: EventResponse<unknown>) => {
            const message = error.message as BackendError
            if (typeof message !== 'string' && message.message === 'Unauthenticated') {
                logout()
            } else {
                displayErrors(message as BackendError)
            }
        })
    }, [])

    useEffect(() => {
        // have a variable that holds the rooms you are subscribed to
        const subscriptions: ReturnType<ReturnType<(typeof socket)['on']>['subscribe']>[] = []
        rooms.forEach((room, index) => {
            const messageSub = socket.on<Message>(`rooms.${room.id}.message`).subscribe(message => {
                setMessagesMap(state => {
                    return {
                        ...state,
                        [room.id]: [...state[room.id] ?? [], message]
                    }
                })

                if (room.id !== selectedRoom && message.user.id !== user?.id) {
                    const newRooms = [...rooms]
                    room.hasNewMessages = true
                    newRooms[index] = room
                    setRooms(newRooms)
                }
            })

            const messagesSub = socket.on<Message[]>(`rooms.${room.id}.messages`).subscribe(value => {
                setMessagesMap(state => {
                    return {
                        ...state,
                        [room.id]: value
                    }
                })
            })

            subscriptions.push(messageSub, messagesSub)
        })
        const roomUpdateSub = socket.on<Message>(`rooms.update`).subscribe(() => {
            socket.emit('rooms.browse')
        })

        const roomRemoveSub = socket.on<Message>(`rooms.remove`).subscribe(() => {
            socket.emit('rooms.browse')
        })

        subscriptions.push(roomUpdateSub, roomRemoveSub)

        return () => {
            subscriptions.forEach(subscription => subscription.unsubscribe())
        }
    }, [rooms, user, selectedRoom])

    const onRoomUpdate = async (id: number, form: object) => {
        await socket.request<Room>('rooms.update', {parameters: [id], body: form})
    }

    const onRoomDelete = async (id: number) => {
        await socket.request('rooms.remove', {parameters: [id]})
        setSelectedRoom(undefined)
        socket.emit('rooms.browse')
    }

    const setStatus = async (status: User['status']) => {
        const response = await socket.request<User>('users.update', {body: {status}})
        setUser(response)
    }

    const logout = () => {
        setUser(undefined)
        localStorage.removeItem('token')
        socket.emit('logout')
    }

    const join1On1Room = async (userId: number) => {
        const room = await socket.request<Room>('rooms.open1To1', {body: userId})
        await openRoom(room.id)
    }

    const joinRoom = async (roomId: number) => {
        const room = await socket.request<Room>('rooms.join', {parameters: [roomId]})
        await openRoom(room.id)
    }

    const openRoom = async (roomId: number) => {
        await socket.request('rooms.browse')
        setSelectedRoom(roomId)
    }

    const selectRoom = async (roomId: number) => {
        const roomIndex = rooms.findIndex(item => item.id === roomId)
        if (roomIndex !== undefined) {
            const newRooms = [...rooms]
            newRooms[roomIndex].hasNewMessages = false
            setRooms(newRooms)
        }
        setSelectedRoom(roomId)
    }

    const onRoomCreate = async () => {
        const room = await socket.request<Room>('rooms.add', {body: {name: roomForm.name}})

        await socket.request('rooms.browse')

        setRoomForm({name: ''})
        setShowCreateRoomModal(false)
        setSelectedRoom(room.id)
    }

    const updateAccount = async () => {
        const userResponse = await socket.request<User>('users.update', {body: userForm})
        setUser(userResponse)
        setShowSettingsModal(false)
        setSelectedRoom(selectedRoom)
    }

    const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) {
            return
        }

        const avatar = await toBase64(file)
        setUserForm({...userForm, avatar})
    }

    const renderCreateRoomModal = () => {
        return <Modal
            okButton="Save"
            title="Create new room"
            visible={showCreateRoomModal}
            onCancel={() => setShowCreateRoomModal(false)}
            onOk={() => onRoomCreate()}
        >
            <form>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text"
                           className="full-width"
                           onChange={(event: ChangeEvent<HTMLInputElement>) => setRoomForm({
                               name: event.target.value
                           })}
                    />
                </div>
            </form>
        </Modal>
    }

    const renderSettingsModal = () => {
        return <Modal
            okButton="Save"
            title="Settings"
            visible={showSettingsModal}
            onCancel={() => setShowSettingsModal(false)}
            onOk={updateAccount}
        >
            <form>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text"
                           className="full-width"
                           value={userForm.name}
                           onChange={(event: ChangeEvent<HTMLInputElement>) => setUserForm({
                               ...userForm,
                               name: event.target.value
                           })}
                    />
                </div>

                <div className="form-group">
                    <label>Avatar</label>

                    <div className="form-avatar">
                        {
                            user?.avatar ? (
                                <>
                                    <div style={avatarStyle(serverAvatar(user.avatar))} className="avatar big"/>
                                    <br/>
                                </>
                            ) : undefined
                        }
                        <input type="file"
                               className="full-width"
                               onChange={(event: ChangeEvent<HTMLInputElement>) => handleAvatarChange(event)}
                        />
                    </div>
                </div>

            </form>
        </Modal>
    }

    function renderLoading() {
        return <div className="card-container">
            <div className="logo">
                <img src="favicon.ico" width="100" alt=""/>
            </div>
            <h1 className="title">
                Typetron chat app
            </h1>
            <h3 className="title">Connecting to server...</h3>
        </div>
    }

    function renderApp(userItem: User) {
        const room = rooms.find(item => item.id === selectedRoom) as Room

        return <>
            <Sidebar
                user={userItem}
                rooms={rooms}
                selectedRoom={selectedRoom}
                onRoomChange={selectRoom}
                onLogout={logout}
                joinRoom={joinRoom}
                onStatusChange={setStatus}
                join1On1Room={join1On1Room}
                onShowSettings={() => setShowSettingsModal(true)}
                onShowCreateRoom={() => setShowCreateRoomModal(true)}
            />

            <div className="content">
                {
                    selectedRoom && room
                        ? <Content authUser={userItem}
                                   room={room}
                                   messages={messagesMap[room.id] ?? []}
                                   onRoomUpdate={onRoomUpdate}
                                   onRoomDelete={onRoomDelete}
                        />
                        : undefined
                }
            </div>

            {renderSettingsModal()}
            {renderCreateRoomModal()}
        </>

    }

    return loading
        ? renderLoading()
        : user
            ? renderApp(user)
            : authPage === 'login'
                ? <Login onLogin={login} onPageChange={setAuthPage}/>
                : <Register onPageChange={setAuthPage}/>

}

export default App
