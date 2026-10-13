import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import ProductSection from '../components/ProductSection'
import { useShop } from '../context/ShopContext'

export default function Product() {
  const { productId } = useParams()
  const { products, productsLoading, currency, addToCart } = useShop()
  const product = products.find((p) => p._id === productId)
  const [image, setImage] = useState(null)
  const [size, setSize] = useState('')
  const [tab, setTab] = useState('description')

  if (!product) {
    if (productsLoading) return <p className="py-24 text-center text-gray-500">Loading…</p>
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500 mb-4">Product not found.</p>
        <Link to="/collection" className="underline">Back to collection</Link>
      </div>
    )
  }

  const mainImage = product.image.includes(image) ? image : product.image[0]
  const related = products
    .filter((p) => p._id !== product._id && p.category === product.category && p.subCategory === product.subCategory)
    .slice(0, 5)

  return (
    <div className="pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-12 flex-col sm:flex-row">
        {/* images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-auto justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {product.image.map((src) => (
              <button key={src} onClick={() => setImage(src)} className="w-[24%] sm:w-full sm:mb-3 shrink-0 cursor-pointer">
                <img src={src} alt="" />
              </button>
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={mainImage} alt={product.name} />
          </div>
        </div>

        {/* info */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{product.name}</h1>
          <div className="flex items-center gap-1 mt-2" aria-label="Rated 4 out of 5">
            {[1, 2, 3, 4].map((i) => <img key={i} src={assets.star_icon} alt="" className="w-3.5" />)}
            <img src={assets.star_dull_icon} alt="" className="w-3.5" />
            <p className="pl-2">(122)</p>
          </div>
          <p className="mt-5 text-3xl font-medium">{currency}{product.price}</p>
          <p className="mt-5 text-gray-500 md:w-4/5">{product.description}</p>

          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  aria-pressed={s === size}
                  className={`border py-2 px-4 bg-gray-100 cursor-pointer ${s === size ? 'border-orange-500' : 'border-gray-100'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => addToCart(product._id, size)} className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700 cursor-pointer">
            ADD TO CART
          </button>
          <hr className="mt-8 sm:w-4/5 border-gray-300" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* description / reviews */}
      <div className="mt-20">
        <div className="flex" role="tablist">
          {[['description', 'Description'], ['reviews', 'Reviews (122)']].map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`border border-gray-300 px-5 py-3 text-sm cursor-pointer ${tab === key ? 'font-semibold' : 'text-gray-500'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-4 border border-gray-300 px-6 py-6 text-sm text-gray-500" role="tabpanel">
          {tab === 'description' ? (
            <>
              <p>
                An e-commerce website is an online platform that facilitates the buying and selling of products or
                services over the internet. It serves as a virtual marketplace where businesses and individuals can
                showcase their products, interact with customers, and conduct transactions without the need for a
                physical presence. E-commerce websites have gained immense popularity due to their convenience,
                accessibility, and the global reach they offer.
              </p>
              <p>
                E-commerce websites typically display products or services along with detailed descriptions, images,
                prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated
                page with relevant information.
              </p>
            </>
          ) : (
            <p>Reviews will appear here once customers start sharing their feedback.</p>
          )}
        </div>
      </div>

      {related.length > 0 && <ProductSection text1="RELATED" text2="PRODUCTS" items={related} subtitle={false} />}
    </div>
  )
}
