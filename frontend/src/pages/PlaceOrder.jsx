import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'react-toastify'
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

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = resolve
    s.onerror = () => reject(new Error('Could not load Razorpay'))
    document.body.appendChild(s)
  })

export default function PlaceOrder() {
  const { token, api, cartLines, setCartItems, navigate, productsLoading } = useShop()
  const [method, setMethod] = useState('cod')
  const [busy, setBusy] = useState(false)
  const [placed, setPlaced] = useState(false)

  if (!token) return <Navigate to="/login" state={{ from: '/place-order' }} replace />
  if (productsLoading) return <p className="py-24 text-center text-gray-500">Loading…</p>
  // placed: the cart is emptied before the navigate to /orders commits
  if (cartLines.length === 0 && !placed) return <Navigate to="/cart" replace />

  const finish = () => {
    setPlaced(true)
    setCartItems({})
    toast.success('Order placed')
    navigate('/orders')
  }

  const payWithRazorpay = async ({ order, key }, address) => {
    await loadRazorpay()
    new window.Razorpay({
      key,
      amount: order.amount,
      currency: order.currency,
      name: 'Forever',
      description: 'Order payment',
      order_id: order.id,
      prefill: { name: `${address.firstName} ${address.lastName}`, email: address.email, contact: address.phone },
      handler: async (response) => {
        const data = await api('/order/verifyRazorpay', { body: response })
        if (data.success) finish()
        else toast.error(data.message)
      },
    }).open()
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const address = Object.fromEntries(new FormData(e.target))
    const items = cartLines.map(({ _id, size, quantity }) => ({ productId: _id, size, quantity }))
    setBusy(true)
    try {
      if (method === 'cod') {
        const data = await api('/order/place', { body: { items, address } })
        return data.success ? finish() : toast.error(data.message)
      }
      if (method === 'stripe') {
        const data = await api('/order/stripe', { body: { items, address } })
        return data.success ? window.location.assign(data.session_url) : toast.error(data.message)
      }
      const data = await api('/order/razorpay', { body: { items, address } })
      return data.success ? await payWithRazorpay(data, address) : toast.error(data.message)
    } catch (err) {
      toast.error(err.message || 'Could not place order')
    } finally {
      setBusy(false)
    }
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
            <button type="submit" disabled={busy} className="bg-black text-white px-16 py-3 text-sm cursor-pointer disabled:opacity-60">
              {busy ? 'PLACING…' : 'PLACE ORDER'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
