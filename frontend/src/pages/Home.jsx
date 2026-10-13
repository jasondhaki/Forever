import Hero from '../components/Hero'
import ProductSection from '../components/ProductSection'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import { useShop } from '../context/ShopContext'

export default function Home() {
  const { products } = useShop()
  return (
    <div>
      <Hero />
      <ProductSection text1="LATEST" text2="COLLECTIONS" items={products.slice(0, 10)} />
      <ProductSection text1="BEST" text2="SELLER" items={products.filter((p) => p.bestseller).slice(0, 5)} />
      <OurPolicy />
      <NewsletterBox />
    </div>
  )
}
