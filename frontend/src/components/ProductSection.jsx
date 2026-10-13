import Title from './Title'
import ProductGrid from './ProductGrid'

export default function ProductSection({ text1, text2, items, subtitle = true }) {
  return (
    <section className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1={text1} text2={text2} />
        {subtitle && (
          <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the.
          </p>
        )}
      </div>
      <ProductGrid items={items} />
    </section>
  )
}
