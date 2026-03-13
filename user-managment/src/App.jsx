import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import UserDetail from './pages/UserDetail'
import CreateUser from './pages/CreateUser'
import Header from './components/Header'

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/create" element={<CreateUser />} />
      </Routes>
    </div>
  )
}

export default App