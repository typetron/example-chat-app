import { FormEvent, useCallback, useState } from 'react'
import { socket } from '../../socket'
import { User } from '../../../../Models/User'

export const Login = ({
    onLogin,
    onPageChange
}: {onLogin: (user: User) => void, onPageChange: (page: 'login' | 'register') => void}) => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const submit = useCallback(async (event: FormEvent) => {
        event.preventDefault()

        try {
            const form = {email, password}
            const {token, user} = await socket.request<{token: string, user: User}>('login', {body: form})
            localStorage.setItem('token', token)
            onLogin(user)
        } catch {}
    }, [email, password, onLogin])

    return <div className="card-container">
        <div className="logo">
            <img src="favicon.ico" width="100" alt=""/>
        </div>
        <h1 className="title">
            Typetron chat app
        </h1>
        <hr/>
        <form className="card" onSubmit={submit}>
            <h2>Login</h2>

            <div className="form-group">
                <label><i className="fa fa-user"/></label>
                <input type="email" placeholder="Email" onChange={(event) => setEmail(event.target.value)}/>
            </div>

            <div className="form-group">
                <label><i className="fa fa-lock"/></label>
                <input type="password" placeholder="Password" onChange={(event) => setPassword(event.target.value)}/>
            </div>

            <div className="card-buttons">
                <button type="submit" className="button">Login</button>
                <span className="link" onClick={() => onPageChange('register')}>Register</span>
            </div>
        </form>
    </div>
}
