import { assets } from '../assets/assets'

const POLICIES = [
  [assets.exchange_icon, 'Easy Exchange Policy', 'We offer hassle free exchange policy'],
  [assets.quality_icon, '7 Days Return Policy', 'We provide 7 days free return policy'],
  [assets.support_img, 'Best Customer Support', 'We provide 24/7 customer support'],
]

export default function OurPolicy() {
  return (
    <section className="flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700">
      {POLICIES.map(([icon, title, text]) => (
        <div key={title}>
          <img src={icon} className="w-12 m-auto mb-5" alt="" />
          <p className="font-semibold">{title}</p>
          <p className="text-gray-400">{text}</p>
        </div>
      ))}
    </section>
  )
}
