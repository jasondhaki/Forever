import { Router } from 'express'
import crypto from 'node:crypto'
import mongoose from 'mongoose'
import Stripe from 'stripe'
import Razorpay from 'razorpay'
import { Order, Product, User } from '../models.js'
import { adminAuth, userAuth } from '../auth.js'

const router = Router()

export const DELIVERY_FEE = 10
const currency = () => (process.env.CURRENCY ?? 'usd').toLowerCase()
const STATUSES = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered']
const ADDRESS_FIELDS = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone']

const stripe = () => (process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null)
const razorpay = () =>
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
    : null

class BadRequest extends Error {}

// Price the order from the database — never trust client-sent prices.
export async function buildOrder(items, address) {
  if (!Array.isArray(items) || !items.length || items.length > 100) throw new BadRequest('Cart is empty')
  if (!address || typeof address !== 'object') throw new BadRequest('Address is required')
  const cleanAddress = {}
  for (const f of ADDRESS_FIELDS) {
    const v = address[f]
    if (typeof v !== 'string' || !v.trim() || v.length > 200) throw new BadRequest(`Address field "${f}" is required`)
    cleanAddress[f] = v.trim()
  }

  const ids = items.map((i) => i?.productId)
  if (!ids.every((id) => mongoose.isValidObjectId(id))) throw new BadRequest('Invalid product')
  const products = new Map((await Product.find({ _id: { $in: ids } }).lean()).map((p) => [String(p._id), p]))

  const lines = items.map(({ productId, size, quantity }) => {
    const p = products.get(productId)
    if (!p) throw new BadRequest('A product in your cart is no longer available')
    if (!p.sizes.includes(size)) throw new BadRequest(`Size ${size} is not available for ${p.name}`)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new BadRequest('Invalid quantity')
    return { productId, name: p.name, price: p.price, image: p.image[0], size, quantity }
  })
  const amount = lines.reduce((s, l) => s + l.price * l.quantity, 0) + DELIVERY_FEE
  return { items: lines, address: cleanAddress, amount }
}

const clearCart = (userId) => User.findByIdAndUpdate(userId, { cartData: {} })

const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res)
  } catch (err) {
    if (err instanceof BadRequest) return res.status(400).json({ success: false, message: err.message })
    throw err
  }
}

// Cash on delivery
router.post('/place', userAuth, handle(async (req, res) => {
  const order = await Order.create({ ...(await buildOrder(req.body?.items, req.body?.address)), userId: req.userId, paymentMethod: 'cod' })
  await clearCart(req.userId)
  res.status(201).json({ success: true, message: 'Order placed', orderId: order._id })
}))

// Stripe Checkout — order is created unpaid, then confirmed in /verifyStripe
router.post('/stripe', userAuth, handle(async (req, res) => {
  const client = stripe()
  if (!client) return res.status(503).json({ success: false, message: 'Stripe is not configured' })
  const built = await buildOrder(req.body?.items, req.body?.address)
  const order = await Order.create({ ...built, userId: req.userId, paymentMethod: 'stripe' })
  const origin = process.env.FRONTEND_URL ?? req.headers.origin

  const line_items = built.items.map((l) => ({
    price_data: { currency: currency(), product_data: { name: `${l.name} (${l.size})` }, unit_amount: Math.round(l.price * 100) },
    quantity: l.quantity,
  }))
  line_items.push({
    price_data: { currency: currency(), product_data: { name: 'Delivery Charges' }, unit_amount: DELIVERY_FEE * 100 },
    quantity: 1,
  })

  const session = await client.checkout.sessions.create({
    mode: 'payment',
    line_items,
    metadata: { orderId: String(order._id) },
    success_url: `${origin}/verify?success=true&orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/verify?success=false&orderId=${order._id}`,
  })
  res.json({ success: true, session_url: session.url })
}))

router.post('/verifyStripe', userAuth, handle(async (req, res) => {
  const { orderId, sessionId } = req.body ?? {}
  if (!mongoose.isValidObjectId(orderId)) throw new BadRequest('Invalid order')
  const order = await Order.findOne({ _id: orderId, userId: req.userId })
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
  if (order.payment) return res.json({ success: true })

  const client = stripe()
  const session = client && typeof sessionId === 'string' ? await client.checkout.sessions.retrieve(sessionId).catch(() => null) : null
  // ponytail: verified on redirect only; add a checkout.session.completed webhook if users may close the tab before returning
  if (session?.metadata?.orderId === String(order._id) && session.payment_status === 'paid') {
    await Order.updateOne({ _id: order._id }, { payment: true, paymentRef: session.payment_intent })
    await clearCart(req.userId)
    return res.json({ success: true })
  }
  await Order.deleteOne({ _id: order._id, payment: false })
  res.json({ success: false, message: 'Payment was not completed' })
}))

// Razorpay — create an order, the browser opens Razorpay Checkout, then /verifyRazorpay checks the signature
router.post('/razorpay', userAuth, handle(async (req, res) => {
  const client = razorpay()
  if (!client) return res.status(503).json({ success: false, message: 'Razorpay is not configured' })
  const built = await buildOrder(req.body?.items, req.body?.address)
  const order = await Order.create({ ...built, userId: req.userId, paymentMethod: 'razorpay' })
  const rzpOrder = await client.orders.create({
    amount: Math.round(built.amount * 100),
    currency: currency().toUpperCase(),
    receipt: String(order._id),
  })
  res.json({ success: true, order: rzpOrder, key: process.env.RAZORPAY_KEY_ID })
}))

router.post('/verifyRazorpay', userAuth, handle(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body ?? {}
  const client = razorpay()
  if (!client) return res.status(503).json({ success: false, message: 'Razorpay is not configured' })
  if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every((v) => typeof v === 'string')) {
    throw new BadRequest('Missing payment details')
  }

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')
  const valid =
    expected.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature))
  if (!valid) return res.status(400).json({ success: false, message: 'Payment verification failed' })

  const rzpOrder = await client.orders.fetch(razorpay_order_id)
  const updated = await Order.findOneAndUpdate(
    { _id: rzpOrder.receipt, userId: req.userId },
    { payment: true, paymentRef: razorpay_payment_id },
  )
  if (!updated) return res.status(404).json({ success: false, message: 'Order not found' })
  await clearCart(req.userId)
  res.json({ success: true, message: 'Payment successful' })
}))

// Unpaid online orders are hidden from the customer
router.get('/user', userAuth, async (req, res) => {
  const orders = await Order.find({ userId: req.userId, $or: [{ paymentMethod: 'cod' }, { payment: true }] })
    .sort({ date: -1 })
    .lean()
  res.json({ success: true, orders })
})

router.get('/list', adminAuth, async (req, res) => {
  const orders = await Order.find().sort({ date: -1 }).lean()
  res.json({ success: true, orders })
})

router.post('/status', adminAuth, handle(async (req, res) => {
  const { orderId, status } = req.body ?? {}
  if (!mongoose.isValidObjectId(orderId) || !STATUSES.includes(status)) throw new BadRequest(`Status must be one of: ${STATUSES.join(', ')}`)
  const updated = await Order.findByIdAndUpdate(orderId, { status })
  if (!updated) return res.status(404).json({ success: false, message: 'Order not found' })
  res.json({ success: true, message: 'Status updated' })
}))

export default router
