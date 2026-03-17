
// Consumir API 

import { useState, useEffect } from "react"

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");


  useEffect(
    () => {
      async function loadUsers(){
        const response = await fetch("https://jsonplaceholder.typicode.com/users")
        const data = await response.json()
        setUsers(data)
      }
    loadUsers()
    }, [])
  
  const filtered = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <>

      <div style={{marginBottom: "10px"}}>
        <input 
          placeholder="Buscar"
          onChange={(e)=> setSearch(e.target.value)}
        />
       </div>

      {filtered.map(user=>(
        <div key={user.id} style={{ marginBottom: "10px" }}>
                  <p>{user.name}</p>
                  <p>{user.email}</p>
                  <p>{user.company.name}</p>
                  <hr />
        </div>
      ))}
    </>
  )
}

export default function App() {
  return (
    <>
      <div>
        <Users />
      </div>
   </>
  )
}
