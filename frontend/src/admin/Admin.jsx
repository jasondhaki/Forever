import { useCallback, useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { backendUrl } from '../context/ShopContext'
import AddProduct from './AddProduct'
import ProductList from './ProductList'
import AdminOrders from './AdminOrders'

const TOKEN_KEY = 'adminToken'
const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function AdminLogin({ onLogin }) {
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch(`${backendUrl}/api/user/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(e.target))),
      })
      const data = await res.json()
      if (data.success) onLogin(data.token)
      else toast.error(data.message)
    } catch {
      toast.error('Could not reach the server')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={onSubmit} className="bg-white shadow-md rounded-lg px-8 py-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <label className="block mb-3">
          <span className="text-sm font-medium text-gray-700">Email Address</span>
          <input name="email" type="email" required autoComplete="username" placeholder="your@email.com"
            className="mt-2 rounded-md w-full px-3 py-2 border border-gray-300 outline-none" />
        </label>
        <label className="block mb-3">
          <span className="text-sm font-medium text-gray-700">Password</span>
          <input name="password" type="password" required autoComplete="current-password" placeholder="Enter your password"
            className="mt-2 rounded-md w-full px-3 py-2 border border-gray-300 outline-none" />
        </label>
        <button type="submit" disabled={busy} className="mt-2 w-full py-2 px-4 rounded-md text-white bg-black cursor-pointer disabled:opacity-60">
          {busy ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </div>
  )
}

const icon = (d) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
)

const NAV = [
  ['add', 'Add Items', icon('M12 5v14M5 12h14')],
  ['list', 'List Items', icon('M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01')],
  ['orders', 'Orders', icon('M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8')],
]

export default function Admin() {
  const [token, setToken] = useState(readToken)

  useEffect(() => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token)
      else localStorage.removeItem(TOKEN_KEY)
    } catch { /* ignore */ }
  }, [token])

  // admin-authenticated fetch; a 401 means the token expired
  const api = useCallback(
    async (path, { body, method = body ? 'POST' : 'GET' } = {}) => {
      const res = await fetch(`${backendUrl}/api${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: body && JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({ success: false, message: 'Server error' }))
      if (res.status === 401) {
        setToken(null)
        toast.error('Session expired, please log in again')
      }
      return data
    },
    [token],
  )

  if (!token) return <AdminLogin onLogin={setToken} />

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="flex items-center justify-between py-2 px-[4%] bg-white border-b border-gray-200">
        <div className="flex items-end gap-2">
          <img src={assets.logo} className="w-28 sm:w-36" alt="Forever" />
          <span className="text-xs font-medium text-pink-700 uppercase tracking-wider">Admin</span>
        </div>
        <button onClick={() => setToken(null)} className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm cursor-pointer">
          Logout
        </button>
      </header>

      <div className="flex w-full">
        <nav className="w-[18%] min-h-[calc(100vh-60px)] border-r border-gray-200 bg-white">
          <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
            {NAV.map(([to, label, icon]) => (
              <NavLink
                key={to}
                to={`/admin/${to}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ${isActive ? 'bg-pink-50 border-pink-300' : ''}`
                }
              >
                {icon}
                <span className="hidden md:block">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <main className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
          <Routes>
            <Route index element={<Navigate to="/admin/add" replace />} />
            <Route path="add" element={<AddProduct api={api} />} />
            <Route path="list" element={<ProductList api={api} />} />
            <Route path="orders" element={<AdminOrders api={api} />} />
            <Route path="*" element={<Navigate to="/admin/add" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
