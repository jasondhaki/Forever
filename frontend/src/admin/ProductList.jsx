import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { currency } from '../context/ShopContext'

const row = 'grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border border-gray-200 text-sm'

export default function ProductList({ api }) {
  const [products, setProducts] = useState(null)

  const load = useCallback(
    () => api('/product/list').then((d) => setProducts(d.success ? d.products : [])).catch(() => setProducts([])),
    [api],
  )
  useEffect(() => { load() }, [load])

  const remove = async (p) => {
    if (!window.confirm(`Remove "${p.name}"? This cannot be undone.`)) return
    const data = await api('/product/remove', { body: { id: p._id } })
    if (!data.success) return toast.error(data.message)
    toast.success('Product removed')
    load()
  }

  return (
    <>
      <p className="mb-2">All Products List {products && `(${products.length})`}</p>
      <div className="flex flex-col gap-2">
        <div className={`${row} hidden md:grid bg-gray-100`}>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center">Action</b>
        </div>

        {products === null && <p className="py-8 text-center">Loading…</p>}
        {products?.length === 0 && <p className="py-8 text-center">No products yet.</p>}

        {products?.map((p) => (
          <div key={p._id} className={`${row} bg-white`}>
            <img className="w-12" src={p.image[0]} alt="" />
            <p>{p.name}</p>
            <p className="hidden md:block">{p.category} · {p.subCategory}</p>
            <p className="hidden md:block">{currency}{p.price}</p>
            <button
              onClick={() => remove(p)}
              className="text-right md:text-center text-lg cursor-pointer hover:text-red-600"
              aria-label={`Remove ${p.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
