import { toast } from 'react-toastify'

export default function NewsletterBox() {
  const onSubmit = (e) => {
    e.preventDefault()
    // ponytail: no subscription backend yet — wire to an email provider when needed
    toast.success('Thanks for subscribing!')
    e.target.reset()
  }

  return (
    <section className="text-center my-20">
      <p className="text-2xl font-medium text-gray-800">Subscribe now &amp; get 20% off</p>
      <p className="text-gray-400 mt-3">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
      <form onSubmit={onSubmit} className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border border-gray-300 pl-3">
        <input className="w-full sm:flex-1 outline-none text-sm" type="email" placeholder="Enter your email id" aria-label="Email" required />
        <button type="submit" className="bg-black text-white text-xs px-10 py-4 cursor-pointer">SUBSCRIBE</button>
      </form>
    </section>
  )
}
