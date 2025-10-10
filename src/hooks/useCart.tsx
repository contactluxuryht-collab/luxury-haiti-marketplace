import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from './use-toast'

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [productPrices, setProductPrices] = useState<Record<string, number>>({})
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchCartItems = async () => {
    if (!user) {
      setCartItems([])
      setLoading(false)
      return
    }

    try {
      // First get the user's internal ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userError) throw userError

      const { data, error } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', userData.id)

      if (error) throw error

      setCartItems(data || [])
      
      // Fetch product prices for cart items
      if (data && data.length > 0) {
        const productIds = [...new Set(data.map(item => item.product_id))]
        const { data: products } = await supabase
          .from('products')
          .select('id, price')
          .in('id', productIds)
        
        const prices: Record<string, number> = {}
        products?.forEach(product => {
          prices[product.id] = product.price
        })
        setProductPrices(prices)
      }
    } catch (error) {
      console.error('Error fetching cart items:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      })
      return
    }

    try {
      // Get user's internal ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userError) throw userError

      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.product_id === productId)

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)

        if (error) throw error
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart')
          .insert([
            {
              user_id: userData.id,
              product_id: productId,
              quantity
            }
          ])

        if (error) throw error
      }

      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      })

      // Fetch the product price for the new item
      const { data: product } = await supabase
        .from('products')
        .select('id, price')
        .eq('id', productId)
        .single()
      
      if (product) {
        setProductPrices(prev => ({
          ...prev,
          [product.id]: product.price
        }))
      }

      fetchCartItems()
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      })
    }
  }

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
      return
    }

    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('id', cartItemId)

      if (error) throw error

      fetchCartItems()
    } catch (error) {
      console.error('Error updating cart quantity:', error)
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    }
  }

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartItemId)

      if (error) throw error

      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
      })

      fetchCartItems()
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      })
    }
  }

  const clearCart = async () => {
    if (!user) return

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userError) throw userError

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userData.id)

      if (error) throw error

      setCartItems([])
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      })
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchCartItems()
  }, [user])

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = productPrices[item.product_id] || 0
    return sum + (price * item.quantity)
  }, 0)

  return {
    cartItems,
    loading,
    totalItems,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refetch: fetchCartItems
  }
}