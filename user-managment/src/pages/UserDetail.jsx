import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { getUser } from "../api/userService"


function UserDetail () {
    const{id} = useParams()
    const[user, setUser] = useState(null)
    
    useEffect(()=>{
        async function loadUser() {
            const res = await getUser(id)
            setUser(res.data)
        }
        loadUser()
    }, [id]) 

    if(!user) return <p>Cargando...</p>

    return (
        <div style={{padding: '16px'}}>
            <h2>{user.name}</h2>
            <p>📧 {user.email}</p>
            <p>📞 {user.phone}</p>
            <p>🌐 {user.website}</p>
            <p>🏢 {user.company.name}</p>
        </div>
    )
}

export default UserDetail