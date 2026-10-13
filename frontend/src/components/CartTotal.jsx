import Title from './Title'
import { useShop } from '../context/ShopContext'

export default function CartTotal() {
  const { currency, delivery_fee, getCartAmount } = useShop()
  const subtotal = getCartAmount()
  const shipping = subtotal === 0 ? 0 : delivery_fee

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1="CART" text2="TOTALS" />
      </div>
      <div className="flex flex-col gap-2 mt-2 text-sm">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>{currency}{subtotal.toFixed(2)}</p>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between">
          <p>Shipping Fee</p>
          <p>{currency}{shipping.toFixed(2)}</p>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between">
          <b>Total</b>
          <b>{currency}{(subtotal + shipping).toFixed(2)}</b>
        </div>
      </div>
    </div>
  )
}
