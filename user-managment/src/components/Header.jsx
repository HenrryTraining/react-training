import { Link } from 'react-router-dom'

function Header() {
    return (
        <header style={{ backgroundColor: '#282c34', padding: '16px', marginBottom: '16px' }}>
            <h1 style={{ color: 'white', margin: '0 0 8px 0' }}>User Management System</h1>
            <nav>
                <Link to="/" style={{ color: '#61dafb', marginRight: '16px' }}>
                    Usuarios
                </Link>
                <Link to="/create" style={{ color: '#61dafb' }}>
                    Crear Usuario
                </Link>
            </nav>
        </header>
    )
}

export default Header