import { ReactNode } from 'react'

interface Props {
    visible: boolean
    onCancel: () => void
    onOk: () => void
    title?: string
    cancelButton?: string
    okButton?: string
    children: ReactNode
}

export const Modal = (props: Props) => {
    return <div className={'modal ' + (props.visible ? 'visible' : '')}>
        <div className="modal-body">
            {
                props.title ?
                    <div className="modal-header">
                        <h4>{props.title}</h4>
                    </div>
                    : undefined
            }
            <div className="modal-content">
                {props.children}
            </div>
            <div className="modal-footer">
                <button onClick={() => props.onCancel()}>{props.cancelButton ?? 'Cancel'}</button>
                <button onClick={() => props.onOk()}>{props.okButton ?? 'OK'}</button>
            </div>
        </div>
    </div>
}

