import {memo} from 'react'
import { Link } from "react-router-dom"

const UserCard = memo(function UserCard({ user }) {
    return (
        <div style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '8px', borderRadius: '8px' }}>
            <h3>{user.name}</h3>
            <p>📧 {user.email}</p>
            <p>📞 {user.phone}</p>
            <Link to={`/users/${user.id}`}>Ver detalle </Link>
        </div>
    )
})

export default UserCard