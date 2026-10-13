import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <img src={assets.logo} className="mb-5 w-32" alt="Forever" />
          <p className="w-full md:w-2/3 text-gray-600">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
            industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book.
          </p>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/collection">Delivery</Link></li>
            <li><Link to="/contact">Privacy policy</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li><a href="tel:+12124567890">+1-212-456-7890</a></li>
            <li><a href="mailto:greatstackdev@gmail.com">greatstackdev@gmail.com</a></li>
          </ul>
        </div>
      </div>
      <hr className="border-gray-300" />
      <p className="py-5 text-sm text-center">Copyright {YEAR} © forever.com - All Right Reserved.</p>
    </footer>
  )
}
