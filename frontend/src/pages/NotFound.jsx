import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="font-prata text-4xl mb-4">Page not found</h1>
      <Link to="/" className="underline text-gray-600">Back to home</Link>
    </div>
  )
}
