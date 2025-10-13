import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface Product {
  id: string
  title: string
  description: string | null
  price: number
  image_url: string | null
  seller_id: string
  category_id: string | null
  created_at: string
  is_active?: boolean | null
  is_featured?: boolean | null
  is_best_seller?: boolean | null
  seller?: {
    name: string | null
    email: string
    phone_number?: string | null
  }
  category?: {
    name: string
    description: string | null
  }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:users!products_seller_id_fkey(name, email, phone_number),
          category:categories(name, description)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return { products, loading, error, refetch: fetchProducts }
}

export function useProductsByCategory(categoryId?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:users!products_seller_id_fkey(name, email),
          category:categories(name, description)
        `)
        .order('created_at', { ascending: false })

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [categoryId])

  return { products, loading, error, refetch: fetchProducts }
}