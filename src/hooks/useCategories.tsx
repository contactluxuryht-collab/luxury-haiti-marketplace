import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface Category {
  id: string
  name: string
  description: string | null
  image_url: string | null
  created_at: string
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      const fetched = data || []
      const hasAdults = fetched.some((c) => (c.name || '').toLowerCase().includes('18+'))
      const augmented = hasAdults
        ? fetched
        : [
            ...fetched,
            {
              id: '18plus',
              name: '18+ (Adults)',
              description: 'Adult products such as vaping and other age-restricted items',
              image_url: null,
              created_at: new Date().toISOString(),
            },
          ]
      setCategories(augmented)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return { categories, loading, error, refetch: fetchCategories }
}