import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js"

export default function CustomerModal({ customer, onClose, onSave }) {
    const { token } = useAuth()

    // Si viene cliente → modo edición con datos precargados
    // Si no viene → modo creación con campos vacíos
    const isEditing = customer !== null && customer !== undefined

    const [name, setName] = useState(customer?.name || '')
    const [email, setEmail] = useState(customer?.email || '')
    const [phone, setPhone] = useState(customer?.phone || '')
    const [address, setAddress] = useState(customer?.address || '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function handleSave() {
        // Validación básica antes de llamar al backend
        if (!name.trim()) {
            setError('El nombre es requerido')
            return
        }
        if (!phone.trim()) {
            setError('El teléfono es requerido')
            return
        }
        if (!email.trim()) {
            setError('El Correo Electrónico es requerido')
            return
        }

        setError(null)
        setLoading(true)

        try {
            const url = isEditing
                ? `${import.meta.env.VITE_API_URL}/api/customers/${customer.id}`
                : `${import.meta.env.VITE_API_URL}/api/customers`

            const method = isEditing ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    address: address.trim()
                })
            })

            if (!response.ok) {
                throw new Error('Error al guardar el cliente')
            }

            onSave()   // avisa a customersPage que guarde exitosamente
            onClose()  // cierra el modal

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        // Fondo oscuro — cubre toda la pantalla
        <div style={styles.overlay} onClick={onClose}>

            {/* El click en el card NO cierra el modal — stopPropagation lo evita */}
            <div style={styles.card} onClick={e => e.stopPropagation()}>

                <div style={styles.header}>
                    <h3 style={styles.title}>
                        {isEditing ? 'Editar cliente' : 'Nuevo cliente'}
                    </h3>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {error && <p style={styles.error}>{error}</p>}

                <div style={styles.field}>
                    <label style={styles.label}>Nombre *</label>
                    <input
                        style={styles.input}
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nombre del cliente"
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>E-mail *</label>
                    <input
                        style={styles.input}
                        type="text"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="E-Mail"
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Teléfono *</label>
                    <input
                        style={styles.input}
                        type="text"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="Teléfono"
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Dirección</label>
                    <input
                        style={styles.input}
                        type="text"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Dirección"
                    />
                </div>

                <div style={styles.footer}>
                    <button
                        style={styles.cancelBtn}
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        style={styles.saveBtn}
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>

            </div>
        </div>
    )
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
    },
    title: {
        margin: 0,
        fontSize: '1.2rem',
        color: '#1a1a2e'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        color: '#999',
        padding: '0.2rem'
    },
    field: {
        marginBottom: '1rem'
    },
    row: {
        display: 'flex',
        gap: '1rem'
    },
    label: {
        display: 'block',
        marginBottom: '0.4rem',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#444'
    },
    input: {
        width: '100%',
        padding: '0.6rem 0.8rem',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '0.95rem',
        boxSizing: 'border-box',
        outline: 'none'
    },
    error: {
        color: '#e53e3e',
        fontSize: '0.9rem',
        backgroundColor: '#fff5f5',
        padding: '0.5rem 0.8rem',
        borderRadius: '6px',
        border: '1px solid #fed7d7',
        marginBottom: '1rem'
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        marginTop: '1.5rem'
    },
    cancelBtn: {
        padding: '0.6rem 1.2rem',
        borderRadius: '8px',
        border: '1px solid #ddd',
        backgroundColor: 'white',
        cursor: 'pointer',
        fontSize: '0.95rem'
    },
    saveBtn: {
        padding: '0.6rem 1.2rem',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#4f46e5',
        color: 'white',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600'
    }
}