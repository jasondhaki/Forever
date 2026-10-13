import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { useShop } from '../context/ShopContext'

const input = 'border border-gray-300 rounded py-1.5 px-3.5 w-full'

const METHODS = [
  ['stripe', <img key="s" className="h-5 mx-4" src={assets.stripe_logo} alt="Stripe" />],
  ['razorpay', <img key="r" className="h-5 mx-4" src={assets.razorpay_logo} alt="Razorpay" />],
  ['cod', <p key="c" className="text-gray-500 text-sm font-medium mx-4">CASH ON DELIVERY</p>],
]

export default function PlaceOrder() {
  const { cartLines, placeOrder } = useShop()
  const [method, setMethod] = useState('cod')
  const [placed, setPlaced] = useState(false)

  // placed: placeOrder empties the cart before its navigate to /orders commits
  if (cartLines.length === 0 && !placed) return <Navigate to="/cart" replace />

  const onSubmit = (e) => {
    e.preventDefault()
    setPlaced(true)
    placeOrder(Object.fromEntries(new FormData(e.target)), method)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh]">
      {/* delivery info */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1="DELIVERY" text2="INFORMATION" />
        </div>
        <div className="flex gap-3">
          <input required name="firstName" className={input} placeholder="First name" autoComplete="given-name" />
          <input required name="lastName" className={input} placeholder="Last name" autoComplete="family-name" />
        </div>
        <input required name="email" type="email" className={input} placeholder="Email address" autoComplete="email" />
        <input required name="street" className={input} placeholder="Street" autoComplete="street-address" />
        <div className="flex gap-3">
          <input required name="city" className={input} placeholder="City" autoComplete="address-level2" />
          <input required name="state" className={input} placeholder="State" autoComplete="address-level1" />
        </div>
        <div className="flex gap-3">
          <input required name="zipcode" className={input} placeholder="Zip code" autoComplete="postal-code" />
          <input required name="country" className={input} placeholder="Country" autoComplete="country-name" />
        </div>
        <input required name="phone" type="tel" className={input} placeholder="Phone" autoComplete="tel" />
      </div>

      {/* totals + payment */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>
        <div className="mt-12">
          <Title text1="PAYMENT" text2="METHOD" />
          <div className="flex gap-3 flex-col lg:flex-row" role="radiogroup">
            {METHODS.map(([key, label]) => (
              <button
                type="button"
                key={key}
                role="radio"
                aria-checked={method === key}
                onClick={() => setMethod(key)}
                className="flex items-center gap-3 border border-gray-300 p-2 px-3 cursor-pointer"
              >
                <span className={`min-w-3.5 h-3.5 border border-gray-300 rounded-full ${method === key ? 'bg-green-400' : ''}`} />
                {label}
              </button>
            ))}
          </div>
          <div className="w-full text-end mt-8">
            <button type="submit" className="bg-black text-white px-16 py-3 text-sm cursor-pointer">PLACE ORDER</button>
          </div>
        </div>
      </div>
    </form>
  )
}
