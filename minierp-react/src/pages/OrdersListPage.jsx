import { useOrders } from "../hooks/useOrders"
import { useNavigate } from "react-router-dom"

export default function OrdersListPage() {
  const { orders, loading, error, deleteOrder } = useOrders()
  const navigate = useNavigate()

  async function handleDelete(order) {
    const confirmed = window.confirm(
      `¿Estás seguro que deseas eliminar la orden "${order.orderNumber}"?`
    )
    if (!confirmed) return

    try {
      await deleteOrder(order.id)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-400">Cargando órdenes...</p>
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
    <div className="p-6 max-w-6xl mx-auto">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-medium text-gray-800">Órdenes</h2>
          <span className="bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1 rounded-full">
            {orders.length} órdenes
          </span>
        </div>
        <button
          onClick={() => navigate("/orders/new")}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Nueva Orden
        </button>
      </div>

      {/* Tabla vacía */}
      {orders.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
          <p className="text-gray-400 text-sm">No hay órdenes registradas</p>
          <button
            onClick={() => navigate("/orders/new")}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Crear primera orden
          </button>
        </div>
      )}

      {/* Tabla de órdenes */}
      {orders.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Nro Orden</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Cliente</th>
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Fecha</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Subtotal</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">IVA 15%</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Total</th>
                <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Ítems</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr
                  key={order.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-blue-600 font-medium">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {order.customerNameSnapshot}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("es-EC")}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    ${order.subtotal.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    ${order.tax.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {order.items.length}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {/* ← botón nuevo */}
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                      >
                        Detalle
                      </button>
                      <button
                        onClick={() => handleDelete(order)}
                        className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}