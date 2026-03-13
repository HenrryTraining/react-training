import { useState, useContext } from "react"
import { UserContext } from "../context/UserContext"

function CreateUser() {
    const[name, setName] = useState('')
    const[email, setEmail] = useState('')
    const{ users, setUsers} = useContext(UserContext)

const handleSubmit = (e) => {
    e.preventDefault()

    const newUser = {
        id: Date.now(),
        name, 
        email
    }

    setUsers([...users, newUser])
    console.log('Usuario agregado: ', newUser)

    setName('')
    setEmail('')

}

    return (
        <form onSubmit={handleSubmit}>
            <input
                placeholder="Name"
                value={name}
                onChange={(e)=>setName(e.target.value)}
            />
            <input
                placeholder="Email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
            />
            <button>Create</button>
        </form>
    )
}
export default CreateUser