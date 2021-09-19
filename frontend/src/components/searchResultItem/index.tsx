import React, { MouseEventHandler } from 'react'
import './style.scss'
import { avatarStyle, serverAvatar } from '../../utils'
import { SearchResult } from '../../../../Models/SearchResults'

export const SearchResultItem = (props: SearchResult & {onClick?: MouseEventHandler<HTMLLIElement>}) => {
    return <li className="contact" onClick={props.onClick}>
        <div style={avatarStyle(serverAvatar(props.avatar))} className="avatar small"/>
        <div className="meta">
            <p className="name">{props.name}</p>
        </div>
    </li>
}
