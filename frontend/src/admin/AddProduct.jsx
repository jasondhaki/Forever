import { useState } from 'react'
import { toast } from 'react-toastify'
import { backendUrl } from '../context/ShopContext'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const field = 'w-full max-w-[500px] px-3 py-2 border border-gray-300 rounded bg-white'

// each slot takes an uploaded file (Vercel Blob) or a pasted URL / /products/... path
export default function AddProduct({ api, token }) {
  const [images, setImages] = useState(['', '', '', ''])
  const [sizes, setSizes] = useState([])
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(null) // { slot, pct }

  const setImage = (i, value) => setImages((prev) => prev.map((v, j) => (j === i ? value : v)))

  const onFile = async (i, file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Choose an image file')
    if (file.size > 5 * 1024 * 1024) return toast.error('Images must be 5 MB or smaller')
    setUploading({ slot: i, pct: 0 })
    try {
      const { upload } = await import('@vercel/blob/client') // only loaded when an upload starts
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
      const blob = await upload(`products/${safeName}`, file, {
        access: 'public',
        handleUploadUrl: `${backendUrl}/api/upload`,
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: ({ percentage }) => setUploading({ slot: i, pct: Math.round(percentage) }),
      })
      setImage(i, blob.url)
    } catch (err) {
      // the SDK hides the server's reason; the usual cause is a missing BLOB_READ_WRITE_TOKEN
      toast.error(/client token/i.test(err.message) ? 'Upload failed: image storage is not set up on the server, or your session expired' : err.message || 'Upload failed')
    } finally {
      setUploading(null)
    }
  }

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
        <p className="mb-2">Product images — click a box to upload, or paste a URL (first one is the main image)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[700px]">
          {images.map((src, i) => (
            <div key={i} className="flex items-center gap-3">
              <label
                className="relative w-16 h-20 shrink-0 border border-dashed border-gray-300 bg-white flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-500"
                title="Upload image"
              >
                {src.trim() ? (
                  <img src={src.trim()} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] leading-tight text-center text-gray-400">Upload<br />{i + 1}</span>
                )}
                {uploading?.slot === i && (
                  <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[10px] text-center">{uploading.pct}%</span>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  disabled={uploading !== null}
                  onChange={(e) => { onFile(i, e.target.files[0]); e.target.value = '' }}
                  aria-label={`Upload image ${i + 1}`}
                />
              </label>
              <input
                value={src}
                onChange={(e) => setImage(i, e.target.value)}
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

      <button type="submit" disabled={busy || uploading !== null} className="w-28 py-3 mt-4 bg-black text-white cursor-pointer disabled:opacity-60">
        {busy ? 'ADDING…' : 'ADD'}
      </button>
    </form>
  )
}
