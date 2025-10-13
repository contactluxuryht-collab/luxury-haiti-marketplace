import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product: {
    id: string
    title: string
    description: string | null
    price: number
    image_url: string | null
    seller: {
      name: string | null
      email: string
    }
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      // Get user profile first
      const { data: userProfile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!userProfile) {
        setWishlist([])
        setLoading(false)
        return
      }

      // First get wishlist items
      const { data: wishlistItems, error: wishlistError } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })

      if (wishlistError) throw wishlistError

      if (!wishlistItems || wishlistItems.length === 0) {
        setWishlist([])
        setLoading(false)
        return
      }

      // Then get product details for each wishlist item
      const productIds = wishlistItems.map(item => item.product_id)
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          title,
          description,
          price,
          image_url,
          seller:users!products_seller_id_fkey(name, email)
        `)
        .in('id', productIds)
        .eq('is_active', true)

      if (productsError) throw productsError

      // Combine wishlist items with product details
      const enrichedWishlist = wishlistItems.map(wishlistItem => ({
        ...wishlistItem,
        product: products?.find(p => p.id === wishlistItem.product_id) || {
          id: wishlistItem.product_id,
          title: 'Product not found',
          description: null,
          price: 0,
          image_url: null,
          seller: { name: null, email: '' }
        }
      }))

      setWishlist(enrichedWishlist)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please sign in to add items to your wishlist')
      return false
    }

    try {
      // Get user profile first
      const { data: userProfile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!userProfile) {
        toast.error('User profile not found')
        return false
      }

      const { error } = await supabase
        .from('wishlist')
        .insert([
          {
            user_id: userProfile.id,
            product_id: productId
          }
        ])

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.error('Product already in wishlist')
        } else {
          throw error
        }
        return false
      }

      toast.success('Added to wishlist')
      fetchWishlist()
      return true
    } catch (err) {
      toast.error('Failed to add to wishlist')
      return false
    }
  }

  const removeFromWishlist = async (productId: string) => {
    if (!user) return false

    try {
      // Get user profile first
      const { data: userProfile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!userProfile) {
        toast.error('User profile not found')
        return false
      }

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userProfile.id)
        .eq('product_id', productId)

      if (error) throw error

      toast.success('Removed from wishlist')
      fetchWishlist()
      return true
    } catch (err) {
      toast.error('Failed to remove from wishlist')
      return false
    }
  }

  const isInWishlist = (productId: string) => {
    if (!user) return false
    return wishlist.some(item => item.product_id === productId)
  }

  useEffect(() => {
    fetchWishlist()
  }, [user])

  return { 
    wishlist, 
    loading, 
    error, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist,
    refetch: fetchWishlist 
  }
}