import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { User } from '../models.js'
import { signToken } from '../auth.js'

const router = Router()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {}
  if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ success: false, message: 'Name is required' })
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) return res.status(400).json({ success: false, message: 'Please enter a valid email' })
  if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' })

  if (await User.exists({ email: email.toLowerCase().trim() })) {
    return res.status(409).json({ success: false, message: 'User already exists' })
  }
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) })
  res.status(201).json({ success: true, token: signToken({ id: user._id }), name: user.name })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Email and password are required' })
  }
  const user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' })
  }
  res.json({ success: true, token: signToken({ id: user._id }), name: user.name })
})

// ponytail: single admin from env vars; move to a role field on User if you need several admins
router.post('/admin', (req, res) => {
  const { email, password } = req.body ?? {}
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !safeEqual(email, ADMIN_EMAIL) || !safeEqual(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }
  res.json({ success: true, token: signToken({ role: 'admin' }) })
})

export default router
