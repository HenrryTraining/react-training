import axios from 'axios'

const API = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com'
})

export const getUsers = () => API.get('/users') 
export const getUser = (id) => API.get(`/users/${id}`)
export const createUser = (data) => API.post('/users', data)
export const deleteUser = (id) => API.delete(`/users/${id}`)