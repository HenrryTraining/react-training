import { useState, useEffect } from "react";
import { useAuth } from "./useAuth"

export function useOrders() {
    const { token } = useAuth();

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // crago todas las ordenes desde la API
    async function fetchOrders() {
        try {
            setLoading(true);

            const respuesta = await fetch(
                `${import.meta.env.VITE_API_URL}/api/orders`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
            if (!respuesta.ok) throw new Error("Error al cargar órdenes");

            const data = await respuesta.json();

            setOrders(data)

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false)
        }
    }

    // se ejecuta automaticamente cuando hook se monta
    useEffect(() => {
        fetchOrders()
    }, [])

    // Crea la Orden nueva - recibe el objeto completo ya calculado
    async function createOrder(orderData) {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/orders`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            }
        )
        if (!response.ok) throw new Error("Error al crear la orden")
        return await response.json()
    }

    //Elimina una orden por Id y recarga la lista
    async function deleteOrder(id) {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/orders/${id}`,
            {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            }
        )
        if (!response.ok) throw new Error("Error al eliminar la orden")
        await fetchOrders()
    }

    return {
        orders,
        loading,
        error,
        createOrder,
        deleteOrder,
        refetch: fetchOrders
    }
}