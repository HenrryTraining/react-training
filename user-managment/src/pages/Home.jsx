import { useContext, useEffect, useState, useMemo } from "react"
import { UserContext } from "../context/UserContext"
import UserCard from "../components/UserCard"
import { getUsers } from "../api/userService"


function Home() {
    const {users, setUsers} = useContext(UserContext)
    const [search, setSearch] = useState('')

    useEffect(()=>{
        async function loadUsers() {
            try {
                const res = await getUsers()
                setUsers(res.data)
            } catch (error) {
                console.error(error)
                
            }
        }
        if(users.length ===0){    
            loadUsers()
        }
    }, [setUsers])

    const filteredUsers = useMemo(() => {
        return users.filter(user=>
            user.name.toLowerCase().includes(search.toLowerCase())
        )
    }, [users, search])

    if(users.length === 0) return <p>Cargando usuarios...</p>
    // console.log('usuarios en Home:', users)
    return (
        <div style={{padding:'16px'}}>
            <h2>Lista de Usuarios</h2>
            <input 
                placeholder="Bucar usuario..." 
                value={search}
                onChange={(e)=> setSearch(e.target.value)}
                style={{marginBottom:'16px', padding: '8px', width: '300px'}}  
            />
            {filteredUsers.map(user=>(
                <UserCard key={user.id} user ={user} />
            ))}
        </div>
    )
}

export default Home