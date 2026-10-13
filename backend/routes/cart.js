import { Router } from 'express'
import { User } from '../models.js'
import { userAuth } from '../auth.js'

const router = Router()

// cartData must be { [productId]: { [size]: positive int } } — keep it small and well-formed
export const isValidCart = (cart) => {
  if (!cart || typeof cart !== 'object' || Array.isArray(cart)) return false
  const entries = Object.entries(cart)
  if (entries.length > 200) return false
  return entries.every(
    ([id, sizes]) =>
      /^[a-f\d]{24}$/i.test(id) &&
      sizes && typeof sizes === 'object' && !Array.isArray(sizes) &&
      Object.entries(sizes).every(([size, q]) => /^[A-Z0-9]{1,5}$/i.test(size) && Number.isInteger(q) && q > 0 && q <= 99),
  )
}

router.get('/', userAuth, async (req, res) => {
  const user = await User.findById(req.userId, 'cartData').lean()
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  res.json({ success: true, cartData: user.cartData ?? {} })
})

router.put('/', userAuth, async (req, res) => {
  const { cartData } = req.body ?? {}
  if (!isValidCart(cartData)) return res.status(400).json({ success: false, message: 'Invalid cart' })
  await User.findByIdAndUpdate(req.userId, { cartData })
  res.json({ success: true })
})

export default router
