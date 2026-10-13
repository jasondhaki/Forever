import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { useShop } from '../context/ShopContext'

export default function Cart() {
  const { cartLines, currency, updateQuantity, navigate } = useShop()

  return (
    <div className="pt-14">
      <div className="text-2xl mb-3">
        <Title text1="YOUR" text2="CART" />
      </div>

      {cartLines.length === 0 ? (
        <div className="py-16 text-center border-t border-gray-200">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link to="/collection" className="bg-black text-white text-sm px-8 py-3 inline-block">CONTINUE SHOPPING</Link>
        </div>
      ) : (
        <>
          <div>
            {cartLines.map(({ _id, size, quantity, product }) => (
              <div
                key={`${_id}-${size}`}
                className="py-4 border-t border-b border-gray-200 text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
              >
                <div className="flex items-start gap-6">
                  <Link to={`/product/${_id}`}>
                    <img className="w-16 sm:w-20" src={product.image[0]} alt={product.name} />
                  </Link>
                  <div>
                    <p className="text-xs sm:text-lg font-medium">{product.name}</p>
                    <div className="flex items-center gap-5 mt-2">
                      <p>{currency}{product.price}</p>
                      <p className="px-2 sm:px-3 sm:py-1 border border-gray-200 bg-slate-50">{size}</p>
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => {
                    const n = Math.floor(Number(e.target.value))
                    if (n >= 1) updateQuantity(_id, size, n)
                  }}
                  aria-label={`Quantity of ${product.name}, size ${size}`}
                  className="border border-gray-300 max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                />
                <button onClick={() => updateQuantity(_id, size, 0)} aria-label={`Remove ${product.name}`} className="cursor-pointer">
                  <img className="w-4 mr-4 sm:w-5" src={assets.bin_icon} alt="" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end my-20">
            <div className="w-full sm:w-[450px]">
              <CartTotal />
              <div className="w-full text-end">
                <button onClick={() => navigate('/place-order')} className="bg-black text-white text-sm my-8 px-8 py-3 cursor-pointer">
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
