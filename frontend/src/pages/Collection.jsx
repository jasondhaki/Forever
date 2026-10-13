import { useMemo, useState } from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import ProductGrid from '../components/ProductGrid'
import { useShop } from '../context/ShopContext'

const toggle = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

function FilterBox({ title, options, selected, onToggle, show }) {
  return (
    <fieldset className={`border border-gray-300 pl-5 py-3 mt-6 ${show ? '' : 'hidden'} sm:block`}>
      <legend className="sr-only">{title}</legend>
      <p className="mb-3 text-sm font-medium">{title}</p>
      <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
        {options.map(([value, label]) => (
          <label key={value} className="flex gap-2 cursor-pointer">
            <input className="w-3" type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value)} />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default function Collection() {
  const { products, search, showSearch } = useShop()
  const [showFilter, setShowFilter] = useState(false)
  const [category, setCategory] = useState([])
  const [subCategory, setSubCategory] = useState([])
  const [sortType, setSortType] = useState('relevant')

  const filtered = useMemo(() => {
    const q = showSearch ? search.trim().toLowerCase() : ''
    const list = products.filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q)) &&
        (!category.length || category.includes(p.category)) &&
        (!subCategory.length || subCategory.includes(p.subCategory)),
    )
    if (sortType === 'low-high') list.sort((a, b) => a.price - b.price)
    if (sortType === 'high-low') list.sort((a, b) => b.price - a.price)
    return list
  }, [products, search, showSearch, category, subCategory, sortType])

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10">
      <aside className="min-w-60">
        <button onClick={() => setShowFilter(!showFilter)} className="my-2 text-xl flex items-center cursor-pointer gap-2">
          FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </button>
        <FilterBox
          title="CATEGORIES"
          options={[['Men', 'Men'], ['Women', 'Women'], ['Kids', 'Kids']]}
          selected={category}
          onToggle={(v) => setCategory((c) => toggle(c, v))}
          show={showFilter}
        />
        <FilterBox
          title="TYPE"
          options={[['Topwear', 'Topwear'], ['Bottomwear', 'Bottomwear'], ['Winterwear', 'Winterwear']]}
          selected={subCategory}
          onToggle={(v) => setSubCategory((c) => toggle(c, v))}
          show={showFilter}
        />
      </aside>

      <div className="flex-1">
        <div className="flex justify-between items-center text-base sm:text-2xl mb-4">
          <Title text1="ALL" text2="COLLECTIONS" />
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="border-2 border-gray-300 text-xs sm:text-sm px-1 sm:px-2 py-1 ml-2"
            aria-label="Sort products"
          >
            <option value="relevant">Sort: Relevant</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>

        {filtered.length ? (
          <ProductGrid items={filtered} className="lg:grid-cols-4" />
        ) : (
          <p className="text-gray-500 py-20 text-center">No products match your filters.</p>
        )}
      </div>
    </div>
  )
}
