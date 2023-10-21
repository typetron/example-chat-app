import { ChangeEvent, useEffect, useState } from 'react'
import { avatarStyle, serverAvatar, toBase64 } from '../../utils'
import { Modal } from '../modal'
import { RoomForm } from '../types'
import { Room } from '../../../../Models/Room'

interface Props {
    visible: boolean
    onCancel: () => void
    onOk: () => void
    room: Room
    onSubmit: (room: RoomForm) => void,
}

export const RoomFormModal = (props: Props) => {
    const [roomForm, setRoomForm] = useState<RoomForm>({
        name: props.room.name,
        type: props.room.type
    })

    useEffect(() => {
        setRoomForm({
            name: props.room.name,
            type: props.room.type
        })
    }, [props.room])

    async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) {
            return
        }

        const avatar = await toBase64(file)
        setRoomForm({...roomForm, avatar})
    }

    return <Modal
        okButton="Save"
        title="Settings"
        visible={props.visible}
        onCancel={props.onCancel}
        onOk={() => props.onSubmit(roomForm)}
    >
        <form>
            <div className="form-group">
                <label>Name</label>
                <input type="text"
                       className="full-width"
                       value={roomForm.name ?? ''}
                       onChange={(event: ChangeEvent<HTMLInputElement>) => setRoomForm({
                           ...roomForm,
                           name: event.target.value
                       })}
                />
            </div>

            <div className="form-group">
                <label>Avatar</label>

                <div className="form-avatar">
                    {
                        props.room.avatar ? (
                            <>
                                <div style={avatarStyle(serverAvatar(props.room.avatar))} className="avatar big"/>
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

            <div className="form-group">
                <label>Public</label>
                <input type="checkbox"
                       checked={roomForm.type === 'public'}
                       onChange={(event: ChangeEvent<HTMLInputElement>) => setRoomForm({
                           ...roomForm,
                           type: event.target.checked ? 'public' : 'private'
                       })}
                />
            </div>

        </form>
    </Modal>

}
