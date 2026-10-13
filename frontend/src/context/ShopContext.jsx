import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { products } from '../assets/assets'

const ShopContext = createContext(null)
export const useShop = () => useContext(ShopContext)

// localStorage can throw (private mode, blocked storage) — fall back to the default
const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* ignore */ }
}

export const currency = '$'
export const delivery_fee = 10

export default function ShopContextProvider({ children }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  // cartItems shape: { [productId]: { [size]: quantity } }
  const [cartItems, setCartItems] = useState(() => load('cartItems', {}))
  // ponytail: orders kept in localStorage until the backend orders API exists
  const [orders, setOrders] = useState(() => load('orders', []))

  useEffect(() => { save('cartItems', cartItems) }, [cartItems])
  useEffect(() => { save('orders', orders) }, [orders])

  const addToCart = (itemId, size) => {
    if (!size) return toast.error('Select Product Size')
    setCartItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [size]: (prev[itemId]?.[size] ?? 0) + 1 },
    }))
    toast.success('Added to cart')
  }

  const updateQuantity = (itemId, size, quantity) => {
    setCartItems((prev) => {
      const item = { ...prev[itemId] }
      if (quantity > 0) item[size] = quantity
      else delete item[size]
      const next = { ...prev, [itemId]: item }
      if (!Object.keys(item).length) delete next[itemId]
      return next
    })
  }

  // flat list of { _id, size, quantity, product } for the cart and checkout
  const cartLines = Object.entries(cartItems).flatMap(([_id, sizes]) => {
    const product = products.find((p) => p._id === _id)
    if (!product) return []
    return Object.entries(sizes).map(([size, quantity]) => ({ _id, size, quantity, product }))
  })

  const getCartCount = () => cartLines.reduce((n, l) => n + l.quantity, 0)
  const getCartAmount = () => cartLines.reduce((sum, l) => sum + l.product.price * l.quantity, 0)

  const placeOrder = (address, paymentMethod) => {
    const date = Date.now()
    setOrders((prev) => [
      ...cartLines.map((l) => ({ ...l, address, paymentMethod, status: 'Order Placed', date })),
      ...prev,
    ])
    setCartItems({})
    toast.success('Order placed')
    navigate('/orders')
  }

  const value = {
    products, currency, delivery_fee, navigate,
    search, setSearch, showSearch, setShowSearch,
    cartItems, cartLines, addToCart, updateQuantity, getCartCount, getCartAmount,
    orders, placeOrder,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}
