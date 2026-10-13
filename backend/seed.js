// Inserts the starter catalogue if the products collection is empty. Usage: npm run seed
import mongoose from 'mongoose'
import { connectDB } from './db.js'
import { Product } from './models.js'
import { products } from './data/products.js'

export async function seed() {
  if (await Product.estimatedDocumentCount()) return 0
  await Product.insertMany(products)
  return products.length
}

if (import.meta.main) {
  await connectDB()
  const n = await seed()
  console.log(n ? `Seeded ${n} products` : 'Products already present, nothing to do')
  await mongoose.disconnect()
}
