import { useState, useEffect } from 'react'
import {getUsers} from '../api/userService'

function useUsers(){
    const[users, setUsers] = useState([])
    const[loading, setLoading] = useState(true)
    const[error, setError] = useState(null)

    useEffect(()=> {
        async function loadUsers() 
        {
            try {
                const res = await getUsers()
                setUsers(res.data)
            } catch (err) {
                console.error(err)
                setError('Error al cargar usuario')
            } finally{
                setLoading(false)
            }
            
        }
        loadUsers()

    },[])

    return {users, loading, error}
}

export default useUsers