import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useShop } from '../context/ShopContext'

const LINKS = [
  ['/', 'HOME'],
  ['/collection', 'COLLECTION'],
  ['/about', 'ABOUT'],
  ['/contact', 'CONTACT'],
]

export default function Navbar() {
  const [visible, setVisible] = useState(false)
  const { setShowSearch, getCartCount, navigate, token, logout } = useShop()
  const { pathname } = useLocation()

  const openSearch = () => {
    setShowSearch(true)
    if (pathname !== '/collection') navigate('/collection')
  }

  return (
    <header className="flex items-center justify-between py-5 font-medium border-b border-gray-300">
      <Link to="/">
        <img src={assets.logo} className="w-36" alt="Forever" />
      </Link>

      <nav className="hidden sm:flex gap-5 text-sm text-gray-700">
        {LINKS.map(([to, label]) => (
          <NavLink key={to} to={to} className="flex flex-col items-center gap-1">
            <p>{label}</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-6">
        <button onClick={openSearch} aria-label="Search" className="cursor-pointer">
          <img src={assets.search_icon} className="w-5" alt="" />
        </button>

        <div className="group relative">
          <Link to={token ? '/orders' : '/login'} aria-label={token ? 'Account' : 'Log in'}>
            <img src={assets.profile_icon} className="w-5" alt="" />
          </Link>
          {token && (
            <div className="group-hover:block group-focus-within:block hidden absolute right-0 pt-4 z-10">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
                <Link to="/orders" className="hover:text-black">Orders</Link>
                <button onClick={() => { logout(); navigate('/login') }} className="text-left hover:text-black cursor-pointer">
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        <Link to="/cart" className="relative" aria-label={`Cart, ${getCartCount()} items`}>
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="" />
          <span className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </span>
        </Link>

        <button onClick={() => setVisible(true)} className="sm:hidden cursor-pointer" aria-label="Open menu">
          <img src={assets.menu_icon} className="w-5" alt="" />
        </button>
      </div>

      {/* mobile sidebar */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-20 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}
      >
        <div className="flex flex-col text-gray-600">
          <button onClick={() => setVisible(false)} className="flex items-center gap-4 p-3 cursor-pointer">
            <img src={assets.dropdown_icon} className="h-4 rotate-90" alt="" />
            <p>Back</p>
          </button>
          {LINKS.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setVisible(false)}
              className={({ isActive }) => `py-2 pl-6 border-b border-gray-200 ${isActive ? 'bg-black text-white' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  )
}
