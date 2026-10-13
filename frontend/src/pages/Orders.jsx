import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Title from '../components/Title'
import { useShop } from '../context/ShopContext'

export default function Orders() {
  const { orders, currency } = useShop()

  return (
    <div className="pt-16">
      <div className="text-2xl">
        <Title text1="MY" text2="ORDERS" />
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center border-t border-gray-200">
          <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet.</p>
          <Link to="/collection" className="bg-black text-white text-sm px-8 py-3 inline-block">START SHOPPING</Link>
        </div>
      ) : (
        orders.map((o, i) => (
          <div key={`${o.date}-${o._id}-${o.size}-${i}`} className="py-4 border-t border-b border-gray-200 text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-6 text-sm">
              <img className="w-16 sm:w-20" src={o.product.image[0]} alt={o.product.name} />
              <div>
                <p className="sm:text-base font-medium">{o.product.name}</p>
                <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                  <p>{currency}{o.product.price}</p>
                  <p>Quantity: {o.quantity}</p>
                  <p>Size: {o.size}</p>
                </div>
                <p className="mt-1">
                  Date: <span className="text-gray-400">{new Date(o.date).toDateString()}</span>
                </p>
                <p className="mt-1">
                  Payment: <span className="text-gray-400">{o.paymentMethod.toUpperCase()}</span>
                </p>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-between">
              <div className="flex items-center gap-2">
                <span className="min-w-2 h-2 rounded-full bg-green-500" />
                <p className="text-sm md:text-base">{o.status}</p>
              </div>
              <button onClick={() => toast.info(`Status: ${o.status}`)} className="border border-gray-300 px-4 py-2 text-sm font-medium rounded-sm cursor-pointer">
                Track Order
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
