import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { ChatRoom } from '../chatRoom'
import './style.scss'
import { Room } from '../../../../Models/Room'
import { User } from '../../../../Models/User'
import { avatarStyle, serverAvatar } from '../../utils'
import { SearchResults } from '../../../../Models/SearchResults'
import { SearchResultItem } from '../searchResultItem'
import { socket } from '../../socket'

interface Props {
    user: User
    rooms: (Room & {hasNewMessages?: boolean})[]
    selectedRoom?: number
    onRoomChange: (id: number) => void
    onShowCreateRoom: () => void
    onStatusChange: (status: User['status']) => void
    onShowSettings: () => void
    onLogout: () => void
    join1On1Room: (userId: number) => void
    joinRoom: (roomId: number) => void
}

const statuses: User['status'][] = ['online', 'away', 'busy', 'offline']

export const Sidebar = (props: Props) => {

    const [showStatuses, setShowStatuses] = useState(false)
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResults>({
        users: [],
        rooms: []
    })

    const handleSearch = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value
        setSearch(searchValue)
    }, [])

    useEffect(() => {
        (async function() {
            if (search) {
                setSearchResults(await socket.request<SearchResults>('searchContacts', {body: search}))
            } else {
                setSearchResults({
                    users: [],
                    rooms: []
                })
            }
        })()
    }, [search])

    return <div id="sidepanel" className="card">
        <div id="profile">
            <div className="wrap">
                <div style={avatarStyle(serverAvatar(props.user.avatar))} className={props.user.status + ' avatar medium'}/>

                <p>{props.user.name}</p>
                <i className="fa fa-chevron-down expand-button" aria-hidden="true" onClick={() => setShowStatuses(!showStatuses)}/>
            </div>

            <div id="status-options" className={showStatuses ? 'active' : ''}>
                <ul>
                    {statuses.map((status, index) =>
                        <li
                            id={'status-' + status}
                            className={props.user.status === status ? 'active' : ''}
                            onClick={() => {
                                setShowStatuses(false)
                                props.onStatusChange(status)
                            }}
                            key={index}
                        >
                            <span className="status-circle"/>
                            <p>{status}</p>
                        </li>
                    )}
                </ul>
            </div>
        </div>
        <div className="form-group search">
            <label htmlFor=""><i className="fa fa-search" aria-hidden="true"/></label>
            <input type="text" value={search} placeholder="Search contacts..." onChange={handleSearch}/>
        </div>
        <div id="contacts">
            <ul>
                {
                    search ? <li className="search-title"><h4>Your contacts</h4></li> : undefined
                }
                {
                    props.rooms
                        .filter(room =>
                            search.toLowerCase()
                                ? (room.name?.toLowerCase().includes(search.toLowerCase()) || room.users.find(user => user.name.toLowerCase().includes(search.toLowerCase())))
                                : true
                        )
                        .map((room, index) =>
                            <li className={'contact ' + (props.selectedRoom === room.id ? ' active ' : '') + (room.hasNewMessages ? ' has-new-messages ' : '')} key={index} onClick={() => {
                                props.onRoomChange(room.id)
                                setSearch('')
                            }}>
                                <ChatRoom room={room} user={props.user}/>
                            </li>
                        )
                }
                {
                    search ? <li className="search-title"><h4>More results</h4></li> : undefined
                }
                {
                    search && searchResults.users
                        .filter(user => !props.rooms.find(room => room.type === 'personal' && room.users.find(roomUser => roomUser.id === user.id)))
                        .map((searchResult, index) =>
                            <SearchResultItem key={index} {...searchResult} onClick={() => {
                                setSearch('')
                                props.join1On1Room(searchResult.id)
                            }}/>
                        )
                }
                {
                    search && searchResults.rooms
                        .filter(room => !props.rooms.find(userRoom => userRoom.id === room.id))
                        .map((searchResult, index) =>
                            <SearchResultItem key={index} {...searchResult} onClick={() => {
                                setSearch('')
                                props.joinRoom(searchResult.id)
                            }}/>
                        )
                }

            </ul>
            {!search && !props.rooms.length ?
                <div style={{textAlign: 'center'}}><i> Search some rooms to find friends</i></div> : undefined}
        </div>
        <div id="bottom-bar">
            {/*<button id="addcontact">*/}
            {/*    <i className="fa fa-user-plus fa-fw" aria-hidden="true"/>*/}
            {/*    <span>Add contact</span>*/}
            {/*</button>*/}
            <button id="settings" onClick={() => props.onShowSettings()}>
                <i className="fa fa-cog fa-fw" aria-hidden="true"/>
                <span>Settings</span>
            </button>
            <button id="settings" onClick={() => props.onLogout()}>
                <i className="fa fa-sign-out" aria-hidden="true"/>
                <span>Logout</span>
            </button>
            <button onClick={() => props.onShowCreateRoom()}>
                <i className="fa fa-plus" aria-hidden="true"/>
                Create room
            </button>
        </div>

    </div>

}
