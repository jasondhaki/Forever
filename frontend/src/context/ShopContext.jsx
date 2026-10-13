import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

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
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch { /* ignore */ }
}

export const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000'
export const currency = '$'
export const delivery_fee = 10

// merge two { id: { size: qty } } carts by summing quantities
const mergeCarts = (a, b) => {
  const out = structuredClone(a)
  for (const [id, sizes] of Object.entries(b)) {
    for (const [size, q] of Object.entries(sizes)) {
      out[id] = { ...out[id], [size]: (out[id]?.[size] ?? 0) + q }
    }
  }
  return out
}

export default function ShopContextProvider({ children }) {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [token, setToken] = useState(() => load('token', null))
  // cartItems shape: { [productId]: { [size]: quantity } }
  const [cartItems, setCartItems] = useState(() => load('cartItems', {}))
  // true once the server cart has been merged in, so we never overwrite it with a stale local cart
  const [cartSynced, setCartSynced] = useState(false)

  const logout = useCallback(() => {
    setToken(null)
    setCartItems({})
    setCartSynced(false)
  }, [])

  const api = useCallback(
    async (path, { body, method = body ? 'POST' : 'GET' } = {}) => {
      const res = await fetch(`${backendUrl}/api${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: body && JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({ success: false, message: 'Server error' }))
      if (res.status === 401 && token) {
        logout()
        toast.error('Session expired, please log in again')
      }
      return data
    },
    [token, logout],
  )

  useEffect(() => { save('token', token) }, [token])
  useEffect(() => { save('cartItems', cartItems) }, [cartItems])

  useEffect(() => {
    api('/product/list')
      .then((data) => (data.success ? setProducts(data.products) : toast.error(data.message)))
      .catch(() => toast.error('Could not reach the store server'))
      .finally(() => setProductsLoading(false))
    // products only need loading once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // returning visit while logged in: the server cart is the source of truth
  useEffect(() => {
    if (!token || cartSynced) return
    api('/cart').then((data) => {
      if (!data.success) return
      setCartItems(data.cartData)
      setCartSynced(true)
    }).catch(() => {})
  }, [token, cartSynced, api])

  // fresh login: merge the guest cart into the saved one
  const login = async (newToken) => {
    const res = await fetch(`${backendUrl}/api/cart`, { headers: { Authorization: `Bearer ${newToken}` } })
    const data = await res.json().catch(() => ({}))
    if (data.success) {
      setCartItems((local) => mergeCarts(data.cartData, local))
      setCartSynced(true)
    }
    setToken(newToken)
  }

  // drop cart entries for products that no longer exist
  useEffect(() => {
    if (productsLoading) return
    const ids = new Set(products.map((p) => p._id))
    setCartItems((prev) => {
      const stale = Object.keys(prev).filter((id) => !ids.has(id))
      if (!stale.length) return prev
      const next = { ...prev }
      stale.forEach((id) => delete next[id])
      return next
    })
  }, [products, productsLoading])

  // push cart changes to the server (debounced)
  useEffect(() => {
    if (!token || !cartSynced || productsLoading) return
    const t = setTimeout(() => api('/cart', { method: 'PUT', body: { cartData: cartItems } }).catch(() => {}), 400)
    return () => clearTimeout(t)
  }, [cartItems, token, cartSynced, productsLoading, api])

  const addToCart = (itemId, size) => {
    if (!size) return toast.error('Select Product Size')
    setCartItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [size]: Math.min((prev[itemId]?.[size] ?? 0) + 1, 99) },
    }))
    toast.success('Added to cart')
  }

  const updateQuantity = (itemId, size, quantity) => {
    setCartItems((prev) => {
      const item = { ...prev[itemId] }
      if (quantity > 0) item[size] = Math.min(quantity, 99)
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

  const value = {
    products, productsLoading, currency, delivery_fee, navigate, api,
    search, setSearch, showSearch, setShowSearch,
    token, login, logout,
    cartItems, setCartItems, cartLines, addToCart, updateQuantity, getCartCount, getCartAmount,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}
