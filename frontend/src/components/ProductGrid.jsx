import { Link } from 'react-router-dom'
import { currency } from '../context/ShopContext'

export function ProductItem({ id, image, name, price }) {
  return (
    <Link to={`/product/${id}`} className="text-gray-700 cursor-pointer">
      <div className="overflow-hidden">
        <img src={image[0]} alt={name} loading="lazy" className="hover:scale-110 transition ease-in-out" />
      </div>
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <p className="text-sm font-medium">{currency}{price}</p>
    </Link>
  )
}

export default function ProductGrid({ items, className = 'lg:grid-cols-5' }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6 ${className}`}>
      {items.map((item) => (
        <ProductItem key={item._id} id={item._id} image={item.image} name={item.name} price={item.price} />
      ))}
    </div>
  )
}
