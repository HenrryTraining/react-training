import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js"

export default function ProductModal({ product, onClose, onSave }) {
    const { token } = useAuth()

    // Si viene producto → modo edición con datos precargados
    // Si no viene → modo creación con campos vacíos
    const isEditing = product !== null && product !== undefined

    const [name, setName] = useState(product?.name || '')
    const [description, setDescription] = useState(product?.description || '')
    const [price, setPrice] = useState(product?.price || '')
    const [stock, setStock] = useState(product?.stock || '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function handleSave() {
        // Validación básica antes de llamar al backend
        if (!name.trim()) {
            setError('El nombre es requerido')
            return
        }
        if (price === '' || isNaN(price) || Number(price) < 0) {
            setError('El precio debe ser un número válido')
            return
        }
        if (stock === '' || isNaN(stock) || Number(stock) < 0) {
            setError('El stock debe ser un número válido')
            return
        }

        setError(null)
        setLoading(true)

        try {
            const url = isEditing
                ? `${import.meta.env.VITE_API_URL}/api/products/${product.id}`
                : `${import.meta.env.VITE_API_URL}/api/products`

            const method = isEditing ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    price: Number(price),
                    stock: Number(stock)
                })
            })

            if (!response.ok) {
                throw new Error('Error al guardar el producto')
            }

            onSave()   // avisa a ProductsPage que guarde exitosamente
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
                        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
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
                        placeholder="Nombre del producto"
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Descripción</label>
                    <input
                        style={styles.input}
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Descripción opcional"
                    />
                </div>

                <div style={styles.row}>
                    <div style={{ ...styles.field, flex: 1 }}>
                        <label style={styles.label}>Precio *</label>
                        <input
                            style={styles.input}
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>

                    <div style={{ ...styles.field, flex: 1 }}>
                        <label style={styles.label}>Stock *</label>
                        <input
                            style={styles.input}
                            type="number"
                            min="0"
                            value={stock}
                            onChange={e => setStock(e.target.value)}
                            placeholder="0"
                        />
                    </div>
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