import {useState, useEffect} from 'react'
import {getUsers} from '../services/api'
import SearchBar from '../components/SearchBar'
import UserCard from '../components/UserCard'

function Home() {
    const [users, setUsers] = useState([])
    const [search, setSearch] = useState("")

    useEffect(() => {
        async function loadUsers() {
            const data = await getUsers()
            setUsers(data)

        }
        loadUsers()
    }, [])
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase())
        )
    return (
        <div>
            <h2>Users</h2>
            <SearchBar setSearch={setSearch} />
            {filteredUsers.map(user => (
                    <UserCard key={user.id} user={user} />
                ))}
        </div>
    )
}

export default Home;