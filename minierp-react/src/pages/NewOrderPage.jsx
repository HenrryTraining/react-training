import { useState } from "react"
import { useOrders } from "../hooks/useOrders"
import { useCustomers } from "../hooks/useCustomers"
import { useProducts } from "../hooks/useProducts"
import { TAX_RATE, TAX_LABEL } from "../config/constants"

export default function NewOrderPage() {
  const { createOrder } = useOrders()
  const { customers } = useCustomers()
  const { products } = useProducts()

  // --- Estado del maestro ---
  const [customerId, setCustomerId] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")

  // --- Estado del detalle ---
  const [items, setItems] = useState([])

  // --- Estado del modal para agregar productos ---
  const [showProductModal, setShowProductModal] = useState(false)

  // --- Estado de guardado ---
  const [saving, setSaving] = useState(false)
  const [savedOrder, setSavedOrder] = useState(null)

  // --- Cálculos en tiempo real ---
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = subtotal + tax

  // --- Cuando el usuario selecciona un cliente ---
  function handleCustomerChange(e) {
    const selectedId = e.target.value
    const customer = customers.find(c => c.id === selectedId)
    if (!customer) {
      setCustomerId("")
      setCustomerName("")
      setCustomerPhone("")
      setCustomerAddress("")
      return
    }
    setCustomerId(customer.id)
    setCustomerName(customer.name)
    setCustomerPhone(customer.phone || "")
    setCustomerAddress(customer.address || "")
  }

  // --- Agregar un producto desde el modal ---
  function handleAddProduct(product) {
    // Si el producto ya está en la lista, solo aumenta la cantidad
    const existing = items.find(i => i.productId === product.id)
    if (existing) {
      setItems(items.map(i =>
        i.productId === product.id
          ? { ...i, quantity: i.quantity + 1, lineTotal: (i.quantity + 1) * i.unitPrice }
          : i
      ))
    } else {
      // Si no está, lo agrega como línea nueva
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: 1,
        lineTotal: product.price
      }])
    }
    setShowProductModal(false)
  }

  // --- Cambiar cantidad de un ítem en la tabla ---
  function handleQuantityChange(productId, newQty) {
    const qty = parseInt(newQty) || 1
    setItems(items.map(i =>
      i.productId === productId
        ? { ...i, quantity: qty, lineTotal: qty * i.unitPrice }
        : i
    ))
  }

  // --- Eliminar un ítem de la tabla ---
  function handleRemoveItem(productId) {
    setItems(items.filter(i => i.productId !== productId))
  }

  // --- Descartar — limpia todo el formulario ---
  function handleDiscard() {
    setCustomerId("")
    setCustomerName("")
    setCustomerPhone("")
    setCustomerAddress("")
    setItems([])
    setSavedOrder(null)
  }

  // --- Guardar la orden ---
  async function handleSave() {
    if (!customerId) {
      alert("Debe seleccionar un cliente")
      return
    }
    if (items.length === 0) {
      alert("Debe agregar al menos un producto")
      return
    }

    try {
      setSaving(true)
      const orderData = {
        customerId,
        customerNameSnapshot: customerName,
        subtotal,
        tax,
        total,
        items: items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        }))
      }
      const created = await createOrder(orderData)
      setSavedOrder(created)
      handleDiscard()
      alert(`Orden ${created.orderNumber} guardada correctamente`)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Encabezado de página */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-gray-800">Nueva Orden</h2>
        <div className="flex gap-3">
          <button
            onClick={handleDiscard}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Descartar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Orden"}
          </button>
        </div>
      </div>

      {/* MAESTRO — datos de la orden */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">

        {/* Fila 1: Número de orden y fecha */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Nro de Orden</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-blue-600 font-medium">
              Auto-generado al guardar
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Fecha</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
              {new Date().toLocaleDateString("es-EC")}
            </div>
          </div>
        </div>

        {/* Fila 2: Cliente */}
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Cliente</label>
          <select
            value={customerId}
            onChange={handleCustomerChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400"
          >
            <option value="">-- Seleccione un cliente --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Fila 3: Teléfono y Dirección — se llenan solos al elegir cliente */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Teléfono</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 min-h-[36px]">
              {customerPhone || "—"}
            </div>
          </div>
          <div className="flex-2 w-full">
            <label className="block text-xs text-gray-500 mb-1">Dirección</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 min-h-[36px]">
              {customerAddress || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* DETALLE — productos de la orden */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">

        {/* Encabezado del detalle */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Productos</h3>
          <button
            onClick={() => setShowProductModal(true)}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Agregar Producto
          </button>
        </div>

        {/* Tabla de productos */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs text-gray-500 font-medium pb-2">Producto</th>
              <th className="text-right text-xs text-gray-500 font-medium pb-2">Precio</th>
              <th className="text-center text-xs text-gray-500 font-medium pb-2">Cantidad</th>
              <th className="text-right text-xs text-gray-500 font-medium pb-2">Total</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8 text-sm">
                  No hay productos agregados
                </td>
              </tr>
            )}
            {items.map(item => (
              <tr key={item.productId} className="border-b border-gray-50">
                <td className="py-2 text-gray-700">{item.productName}</td>
                <td className="py-2 text-right text-gray-700">
                  ${item.unitPrice.toFixed(2)}
                </td>
                <td className="py-2 text-center">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleQuantityChange(item.productId, e.target.value)}
                    className="w-16 text-center border border-gray-200 rounded px-1 py-0.5 text-sm focus:outline-none focus:border-blue-400"
                  />
                </td>
                <td className="py-2 text-right font-medium text-gray-700">
                  ${item.lineTotal.toFixed(2)}
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        {items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col items-end gap-1">
            <div className="flex gap-8 text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="w-24 text-right">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-600">
              <span>{TAX_LABEL}</span>
              <span className="w-24 text-right">${tax.toFixed(2)}</span>
            </div>
            <div className="flex gap-8 text-sm font-medium text-gray-800 mt-1 pt-1 border-t border-gray-200">
              <span>Total</span>
              <span className="w-24 text-right">${total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal para seleccionar producto */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-800">Seleccionar Producto</h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {products.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.description}</p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}