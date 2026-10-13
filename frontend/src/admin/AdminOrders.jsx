import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { currency } from '../context/ShopContext'

// must match STATUSES in backend/routes/order.js
const STATUSES = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered']

const ParcelIcon = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8M7.5 5.5l9 5" />
  </svg>
)

export default function AdminOrders({ api }) {
  const [orders, setOrders] = useState(null)

  const load = useCallback(
    () => api('/order/list').then((d) => setOrders(d.success ? d.orders : [])).catch(() => setOrders([])),
    [api],
  )
  useEffect(() => { load() }, [load])

  const setStatus = async (orderId, status) => {
    const data = await api('/order/status', { body: { orderId, status } })
    if (!data.success) return toast.error(data.message)
    setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)))
    toast.success('Status updated')
  }

  return (
    <div>
      <h3 className="mb-3">Orders {orders && `(${orders.length})`}</h3>
      {orders === null && <p className="py-8 text-center">Loading…</p>}
      {orders?.length === 0 && <p className="py-8 text-center">No orders yet.</p>}

      {orders?.map((o) => (
        <div
          key={o._id}
          className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 bg-white p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
        >
          <ParcelIcon />
          <div>
            <div>
              {o.items.map((it, i) => (
                <p key={i} className="py-0.5">
                  {it.name} x {it.quantity} <span>{it.size}</span>
                </p>
              ))}
            </div>
            <p className="mt-3 mb-2 font-medium">{o.address.firstName} {o.address.lastName}</p>
            <div>
              <p>{o.address.street},</p>
              <p>{o.address.city}, {o.address.state}, {o.address.country}, {o.address.zipcode}</p>
            </div>
            <p>{o.address.phone}</p>
          </div>
          <div>
            <p className="text-sm sm:text-[15px]">Items: {o.items.reduce((n, it) => n + it.quantity, 0)}</p>
            <p className="mt-3">Method: {o.paymentMethod.toUpperCase()}</p>
            <p>Payment: <span className={o.payment ? 'text-green-600' : 'text-amber-600'}>{o.payment ? 'Done' : 'Pending'}</span></p>
            <p>Date: {new Date(o.date).toLocaleDateString()}</p>
          </div>
          <p className="text-sm sm:text-[15px] font-medium">{currency}{o.amount}</p>
          <select
            value={o.status}
            onChange={(e) => setStatus(o._id, e.target.value)}
            className="p-2 font-semibold border border-gray-300 rounded"
            aria-label={`Status of order ${o._id}`}
          >
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      ))}
    </div>
  )
}
