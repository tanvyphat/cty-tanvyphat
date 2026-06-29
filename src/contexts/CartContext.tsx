'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export interface CartItem {
  cartKey: string    // `${productId}-${unitId}` — unique identifier
  productId: number
  unitId: number
  slug: string
  name: string
  image: string | null
  price: number | null
  unit: string | null
  weight_grams: number | null
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  hydrated: boolean
  addItem: (product: Omit<CartItem, 'quantity' | 'cartKey'>) => void
  removeItem: (cartKey: string) => void
  updateQuantity: (cartKey: string, quantity: number) => void
  clearCart: () => void
}

const CART_KEY = 'tvp_cart'

function readStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed: CartItem[] = JSON.parse(raw)
    // Bỏ qua dữ liệu cũ chưa có unitId
    if (parsed.some(i => i.unitId == null)) return []
    return parsed
  } catch {
    return []
  }
}

function writeStorage(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setItems(readStorage())
    setHydrated(true)
  }, [])

  const addItem = useCallback((product: Omit<CartItem, 'quantity' | 'cartKey'>) => {
    const cartKey = `${product.productId}-${product.unitId}`
    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey)
      const next = existing
        ? prev.map((i) =>
            i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...prev, { ...product, cartKey, quantity: 1 }]
      writeStorage(next)
      return next
    })
  }, [])

  const removeItem = useCallback((cartKey: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.cartKey !== cartKey)
      writeStorage(next)
      return next
    })
  }, [])

  const updateQuantity = useCallback((cartKey: string, quantity: number) => {
    if (quantity < 1) return
    setItems((prev) => {
      const next = prev.map((i) => (i.cartKey === cartKey ? { ...i, quantity } : i))
      writeStorage(next)
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    writeStorage([])
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, hydrated, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within <CartProvider>')
  return ctx
}
