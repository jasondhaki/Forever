import express from 'express'
import cors from 'cors'
import { connectDB } from './db.js'
import userRouter from './routes/user.js'
import productRouter from './routes/product.js'
import cartRouter from './routes/cart.js'
import orderRouter from './routes/order.js'

const app = express()

// FRONTEND_URL may be a comma-separated list; unset = allow any origin (local dev)
const origins = process.env.FRONTEND_URL?.split(',').map((s) => s.trim())
app.use(cors(origins ? { origin: origins } : undefined))
app.use(express.json({ limit: '100kb' }))

app.get('/', (req, res) => res.send('Forever API is running'))

app.use('/api', async (req, res, next) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set')
  await connectDB()
  next()
})
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

app.use((req, res) => res.status(404).json({ success: false, message: 'Not found' }))

// Express 5 forwards rejected promises here
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'Invalid JSON' })
  console.error(err)
  res.status(500).json({ success: false, message: 'Something went wrong' })
})

// Vercel and tests import the app; `node server.js` listens
if (import.meta.main) {
  const port = process.env.PORT ?? 4000
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`))
}

export default app
