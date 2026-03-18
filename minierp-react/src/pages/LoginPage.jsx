import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage () {
    const {login} = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);     //limpia errores anteriores
        setLoading(true);   // Activa el indicador de carga

        try {
            await login(email, password)
            // si llega acá -> login exitoso
            // App.jsx detecta isAuth=true y muestra la app automaticamente
        } catch (err) {
            setError(err.message); // muestra el error en pantalla
        } finally {
            setLoading(false) // siempre seactiva el loading al terminar
        }

    }

    return(
        <div style={styles.container}>
            <div style={styles.card}>

                <h2 style={styles.title}>Mini ERP</h2>
                <p style={styles.subtitle}>Inicia la sesion para continuar</p>

                <form onSubmit={handleSubmit}>

                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <input 
                            style={styles.input} 
                            type="email" 
                            value={email}
                            onChange={e=>setEmail(e.target.value)}
                            placeholder="Ingrese el E-mail"
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Contraseña</label>
                        <input 
                            style={styles.input} 
                            type="password" 
                            value={password}
                            onChange={e=>setPassword(e.target.value)}
                            placeholder="**********"
                            required
                        />
                    </div>

                    {error && (
                        <p style={styles.error}>{error}</p>
                    )}
                    <button
                        style={styles.button}
                        type="submit"
                        disabled={loading}
                        >
                            {loading ? 'Ingresando...': 'Ingresar'}
                    </button>

                </form>
            </div>
        </div>
    )

    }

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5'
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    margin: '0 0 0.25rem',
    fontSize: '1.8rem',
    color: '#1a1a2e'
  },
  subtitle: {
    margin: '0 0 1.5rem',
    color: '#666',
    fontSize: '0.95rem'
  },
  field: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.4rem',
    fontSize: '0.9rem',
    color: '#444',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    boxSizing: 'border-box',
    outline: 'none'
  },
  error: {
    color: '#e53e3e',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    backgroundColor: '#fff5f5',
    padding: '0.5rem 0.8rem',
    borderRadius: '6px',
    border: '1px solid #fed7d7'
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem'
  }
}
