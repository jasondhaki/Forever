import { useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useShop } from '../context/ShopContext'

export default function SearchBar() {
  const { search, setSearch, showSearch, setShowSearch } = useShop()
  const { pathname } = useLocation()

  if (!showSearch || pathname !== '/collection') return null

  return (
    <div className="border-b border-gray-300 bg-gray-50 text-center">
      <div className="inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none bg-inherit text-sm"
          type="search"
          placeholder="Search"
          aria-label="Search products"
          autoFocus
        />
        <img src={assets.search_icon} className="w-4" alt="" />
      </div>
      <button
        onClick={() => { setShowSearch(false); setSearch('') }}
        className="text-2xl text-gray-500 cursor-pointer align-middle"
        aria-label="Close search"
      >
        ×
      </button>
    </div>
  )
}
