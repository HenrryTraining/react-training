import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export function useProducts() {
  const {token} = useAuth()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchProducts() {
    setLoading(true);
    setError(null);

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
            headers: {
                'Authorization': `Bearer ${token}` // el token que guardamos al hacer login
            }
        })

        if (!response.ok) {
            throw new Error("Error al cargar los productos");
        }

        const data = await response.json();
        setProducts(data);
    } catch (error) {
        setError(error.message);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts()
  },[])

  return{
    products,
    loading,
    error,
    refetch: fetchProducts
  }
    
}