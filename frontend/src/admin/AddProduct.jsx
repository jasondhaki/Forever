import { useState } from 'react'
import { toast } from 'react-toastify'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const field = 'w-full max-w-[500px] px-3 py-2 border border-gray-300 rounded bg-white'

// ponytail: images are URLs (or /products/... paths); add file upload once a storage service is chosen
export default function AddProduct({ api }) {
  const [images, setImages] = useState(['', '', '', ''])
  const [sizes, setSizes] = useState([])
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    const image = images.map((s) => s.trim()).filter(Boolean)
    if (!image.length) return toast.error('Add at least one image URL')
    if (!sizes.length) return toast.error('Select at least one size')

    const form = new FormData(e.target)
    setBusy(true)
    try {
      const data = await api('/product/add', {
        body: {
          name: form.get('name'),
          description: form.get('description'),
          price: Number(form.get('price')),
          category: form.get('category'),
          subCategory: form.get('subCategory'),
          bestseller: form.get('bestseller') === 'on',
          sizes: SIZES.filter((s) => sizes.includes(s)),
          image,
        },
      })
      if (!data.success) return toast.error(data.message)
      toast.success('Product added')
      e.target.reset()
      setImages(['', '', '', ''])
      setSizes([])
    } catch {
      toast.error('Could not reach the server')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col w-full items-start gap-4">
      <div className="w-full">
        <p className="mb-2">Product images (URLs, first one is the main image)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[700px]">
          {images.map((src, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-16 h-20 shrink-0 border border-dashed border-gray-300 bg-white flex items-center justify-center overflow-hidden">
                {src.trim() ? <img src={src.trim()} alt="" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">{i + 1}</span>}
              </div>
              <input
                value={src}
                onChange={(e) => setImages((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                className={field}
                placeholder={i === 0 ? 'https://… or /products/p_img1.png' : 'Optional'}
                aria-label={`Image ${i + 1} URL`}
              />
            </div>
          ))}
        </div>
      </div>

      <label className="w-full">
        <p className="mb-2">Product name</p>
        <input name="name" className={field} placeholder="Type here" required />
      </label>

      <label className="w-full">
        <p className="mb-2">Product description</p>
        <textarea name="description" className={field} rows={4} placeholder="Write content here" required />
      </label>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <label>
          <p className="mb-2">Product category</p>
          <select name="category" className="w-full px-3 py-2 border border-gray-300 rounded bg-white">
            <option>Men</option>
            <option>Women</option>
            <option>Kids</option>
          </select>
        </label>
        <label>
          <p className="mb-2">Sub category</p>
          <select name="subCategory" className="w-full px-3 py-2 border border-gray-300 rounded bg-white">
            <option>Topwear</option>
            <option>Bottomwear</option>
            <option>Winterwear</option>
          </select>
        </label>
        <label>
          <p className="mb-2">Product price</p>
          <input name="price" type="number" min="1" step="0.01" className="w-full px-3 py-2 sm:w-[120px] border border-gray-300 rounded bg-white" placeholder="25" required />
        </label>
      </div>

      <fieldset>
        <legend className="mb-2">Product sizes</legend>
        <div className="flex gap-3">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={sizes.includes(s)}
              onClick={() => setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))}
              className={`px-3 py-1 cursor-pointer ${sizes.includes(s) ? 'bg-pink-100' : 'bg-slate-200'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex gap-2 mt-2 cursor-pointer">
        <input name="bestseller" type="checkbox" />
        Add to bestseller
      </label>

      <button type="submit" disabled={busy} className="w-28 py-3 mt-4 bg-black text-white cursor-pointer disabled:opacity-60">
        {busy ? 'ADDING…' : 'ADD'}
      </button>
    </form>
  )
}
