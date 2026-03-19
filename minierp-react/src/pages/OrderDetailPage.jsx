import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { TAX_LABEL } from "../config/constants"

export default function OrderDetailPage() {
  const { id } = useParams()        // lee el id de la URL
  const navigate = useNavigate()
  const { token } = useAuth()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true)
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        if (!response.ok) throw new Error("Orden no encontrada")
        const data = await response.json()
        setOrder(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])  // se vuelve a ejecutar si el id cambia

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-400">Cargando orden...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Volver */}
      <button
        onClick={() => navigate("/orders")}
        className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1"
      >
        ← Volver a órdenes
      </button>

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-50 text-indigo-600 font-medium text-sm px-4 py-1.5 rounded-full">
            #{order.orderNumber}
          </span>
          <h2 className="text-2xl font-medium text-gray-800">Detalle de Orden</h2>
        </div>
      </div>

      {/* MAESTRO — información del cliente */}
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
        Información del cliente
      </p>
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Cliente</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
              {order.customerNameSnapshot}
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Fecha</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
              {new Date(order.createdAt).toLocaleDateString("es-EC")}
            </div>
          </div>
        </div>
      </div>

      {/* DETALLE — productos */}
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
        Productos
      </p>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs text-gray-500 font-medium pb-3">Producto</th>
              <th className="text-right text-xs text-gray-500 font-medium pb-3">Precio unit.</th>
              <th className="text-center text-xs text-gray-500 font-medium pb-3">Cantidad</th>
              <th className="text-right text-xs text-gray-500 font-medium pb-3">Total línea</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="py-3 text-gray-700">{item.productName}</td>
                <td className="py-3 text-right text-gray-700">
                  ${item.unitPrice.toFixed(2)}
                </td>
                <td className="py-3 text-center text-gray-700">
                  {item.quantity}
                </td>
                <td className="py-3 text-right font-medium text-gray-800">
                  ${item.lineTotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col items-end gap-1">
          <div className="flex gap-8 text-sm text-gray-500">
            <span>Subtotal</span>
            <span className="w-28 text-right">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <span>{TAX_LABEL}</span>
            <span className="w-28 text-right">${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-blue-600 mt-2 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span className="w-28 text-right">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

    </div>
  )
}