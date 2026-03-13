import { useState } from 'react'
import { UserContext } from './UserContext'

export function UserProvider({ children }) {
    const [users, setUsers] = useState([])

    return (
        <UserContext.Provider value={{ users, setUsers }}>
            {children}
        </UserContext.Provider>
    )
}