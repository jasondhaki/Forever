import jwt from 'jsonwebtoken'

export const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })

const verify = (req) => {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}

export const userAuth = (req, res, next) => {
  const payload = verify(req)
  if (!payload?.id) return res.status(401).json({ success: false, message: 'Not authorized, please log in again' })
  req.userId = payload.id
  next()
}

export const adminAuth = (req, res, next) => {
  const payload = verify(req)
  if (payload?.role !== 'admin') return res.status(401).json({ success: false, message: 'Admin access required' })
  next()
}
