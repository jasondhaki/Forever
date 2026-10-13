import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useShop } from '../context/ShopContext'

// Stripe Checkout redirects back here
export default function Verify() {
  const { api, navigate, setCartItems, token } = useShop()
  const [params] = useSearchParams()
  const ran = useRef(false)

  useEffect(() => {
    if (!token || ran.current) return
    ran.current = true
    api('/order/verifyStripe', { body: { orderId: params.get('orderId'), sessionId: params.get('session_id') } })
      .then((data) => {
        if (data.success) {
          setCartItems({})
          toast.success('Payment successful')
          navigate('/orders', { replace: true })
        } else {
          toast.error(data.message ?? 'Payment was not completed')
          navigate('/cart', { replace: true })
        }
      })
      .catch(() => navigate('/cart', { replace: true }))
  }, [token, api, params, navigate, setCartItems])

  return <p className="py-24 text-center text-gray-500">Verifying your payment…</p>
}
