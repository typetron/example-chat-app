import { Room } from '../../../Models/Room'

export interface RoomForm {
    name: string
    avatar?: string
    type: Room['type']
}
