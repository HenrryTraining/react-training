import { useProducts } from "../hooks/useProducts";
import { useState } from "react";
import ProductModal from "../components/ProductModal.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function ProductsPage() {
  const { products, loading, error, refetch } = useProducts()
  const { token } = useAuth();  // se usará para eliminar
  const [search, setSearch] = useState('')

  // estados del modal de nuevo, insert
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  //  calcular los productos filtrados
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `¿Estás seguro que querés eliminar "${product.name}"?`
    )
    if (!confirmed) return  // si cancela, no hace nada

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${product.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Error al eliminar el producto')
      }

      refetch()  // actualiza la tabla

    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div style={styles.center}>
        <p>Gargando Productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.center}>
        <p style={styles.error}>{error}</p>
      </div>
    )
  }


  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h2 style={styles.title}>Productos</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={styles.badge}>{filtered.length} productos</span>
          <button
            style={styles.newBtn}
            onClick={() => {
              setSelectedProduct(null)  // null = modo creación
              setModalOpen(true)
            }}
          >
            + Nuevo Producto
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div style={styles.searchBox}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button
            style={styles.clearBtn}
            onClick={() => setSearch('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Mensaje cuando no hay resultados */}
      {filtered.length === 0 && (
        <div style={styles.empty}>
          <p>No se encontraron productos para "{search}"</p>
        </div>
      )}

      {/* Tabla */}
      {filtered.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Descripción</th>
              <th style={styles.th}>Precio</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(product => (
              <tr key={product.id} style={styles.tr}>
                <td style={styles.td}>{product.name}</td>
                <td style={styles.td}>{product.description}</td>
                <td style={styles.td}>${product.price.toFixed(2)}</td>
                <td style={styles.td}>{product.stock}</td>
                <td style={styles.td}>
                  <button
                    style={styles.editBtn}
                    onClick={() => {
                      setSelectedProduct(product)  // pasa el producto al modal
                      setModalOpen(true)           // abre el modal en modo edición
                    }}
                  >
                    Editar
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(product)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal de crear/editar */}
      {modalOpen && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setModalOpen(false)}
          onSave={() => {
            refetch()
            setModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '2rem'
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#1a1a2e'
  },
  badge: {
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#666',
    borderBottom: '1px solid #eee'
  },
  tr: {
    borderBottom: '1px solid #f0f0f0'
  },
  td: {
    padding: '0.75rem 1rem',
    fontSize: '0.95rem',
    color: '#333'
  },
  error: {
    color: '#e53e3e'
  },

  searchBox: {
    position: 'relative',
    marginBottom: '1.5rem',
    maxWidth: '400px'
  },
  searchInput: {
    width: '100%',
    padding: '0.6rem 2.5rem 0.6rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: 'white'
  },
  clearBtn: {
    position: 'absolute',
    right: '0.6rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
    fontSize: '0.9rem',
    padding: '0.2rem'
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    color: '#999',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  editBtn: {
    padding: '0.3rem 0.8rem',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: '#444'
  },
  deleteBtn: {
  padding: '0.3rem 0.8rem',
  backgroundColor: '#fff5f5',
  border: '1px solid #fed7d7',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  color: '#e53e3e'
}
}