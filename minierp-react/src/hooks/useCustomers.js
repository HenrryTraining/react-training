import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export function useCustomers() {
  const {token} = useAuth()

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchCustomers() {
    setLoading(true);
    setError(null);

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/customers`, {
            headers: {
                'Authorization': `Bearer ${token}` // el token que guardamos al hacer login
            }
        })

        if (!response.ok) {
            throw new Error("Error al cargar los clientes");
        }

        const data = await response.json();
        setCustomers(data);
    } catch (error) {
        setError(error.message);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers()
  },[])

  return{
    customers,
    loading,
    error,
    refetch: fetchCustomers
  }
    
}