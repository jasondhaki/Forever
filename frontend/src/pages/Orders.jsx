import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Title from '../components/Title'
import { useShop } from '../context/ShopContext'

export default function Orders() {
  const { token, api, currency } = useShop()
  const [orders, setOrders] = useState(null)

  const loadOrders = () =>
    api('/order/user').then((data) => setOrders(data.success ? data.orders : [])).catch(() => setOrders([]))

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (token) loadOrders() }, [token])

  if (!token) return <Navigate to="/login" state={{ from: '/orders' }} replace />

  // one row per item, carrying its order's status / payment / date
  const rows = (orders ?? []).flatMap((o) => o.items.map((item, i) => ({ ...item, order: o, key: `${o._id}-${i}` })))

  return (
    <div className="pt-16">
      <div className="text-2xl">
        <Title text1="MY" text2="ORDERS" />
      </div>

      {orders === null ? (
        <p className="py-16 text-center text-gray-500 border-t border-gray-200">Loading orders…</p>
      ) : rows.length === 0 ? (
        <div className="py-16 text-center border-t border-gray-200">
          <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet.</p>
          <Link to="/collection" className="bg-black text-white text-sm px-8 py-3 inline-block">START SHOPPING</Link>
        </div>
      ) : (
        rows.map(({ key, order, ...item }) => (
          <div key={key} className="py-4 border-t border-b border-gray-200 text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-6 text-sm">
              <img className="w-16 sm:w-20" src={item.image} alt={item.name} />
              <div>
                <p className="sm:text-base font-medium">{item.name}</p>
                <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                  <p>{currency}{item.price}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                </div>
                <p className="mt-1">
                  Date: <span className="text-gray-400">{new Date(order.date).toDateString()}</span>
                </p>
                <p className="mt-1">
                  Payment: <span className="text-gray-400">{order.paymentMethod.toUpperCase()} · {order.payment ? 'Paid' : 'Pending'}</span>
                </p>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-between">
              <div className="flex items-center gap-2">
                <span className="min-w-2 h-2 rounded-full bg-green-500" />
                <p className="text-sm md:text-base">{order.status}</p>
              </div>
              <button onClick={loadOrders} className="border border-gray-300 px-4 py-2 text-sm font-medium rounded-sm cursor-pointer">
                Track Order
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
