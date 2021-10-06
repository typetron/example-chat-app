import { FormEvent, useState, useCallback } from 'react'
import { socket } from '../../socket'

export const Register = ({onPageChange}: {onPageChange: (page: 'login' | 'register') => void}) => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')

    const submit = useCallback(async (event: FormEvent) => {
        event.preventDefault()

        try {
            const form = {email, name, password, passwordConfirmation}
            await socket.request('register', {body: form})
            alert('Registered successfully!')
            onPageChange('login')
        } catch {}

    }, [email, password, name, passwordConfirmation, onPageChange])

    return <div className="card-container">
        <div className="logo">
            <img src="favicon.ico" width="100" alt=""/>
        </div>
        <h1 className="title">
            Typetron chat app
        </h1>
        <hr/>
        <form className="card" onSubmit={submit}>
            <h2>Register</h2>

            <div className="form-group">
                <label><i className="fa fa-user"/></label>
                <input placeholder="Display name" onChange={(event) => setName(event.target.value)}/>
            </div>

            <div className="form-group">
                <label><i className="fa fa-envelope"/></label>
                <input type="text" placeholder="Email" onChange={(event) => setEmail(event.target.value)}/>
            </div>

            <div className="form-group">
                <label><i className="fa fa-lock"/></label>
                <input type="password" placeholder="Password" onChange={(event) => setPassword(event.target.value)}/>
            </div>


            <div className="form-group">
                <label><i className="fa fa-lock"/></label>
                <input type="password" placeholder="Repeat password" onChange={(event) => setPasswordConfirmation(event.target.value)}/>
            </div>

            <div className="card-buttons">
                <button type="submit" className="button">Register</button>
                <span className="link" onClick={() => onPageChange('login')}>Login</span>
            </div>
        </form>
    </div>
}
