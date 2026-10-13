import { Router } from 'express'
import mongoose from 'mongoose'
import { Product } from '../models.js'
import { adminAuth } from '../auth.js'

const router = Router()

router.get('/list', async (req, res) => {
  const products = await Product.find().sort({ date: -1 }).lean()
  res.json({ success: true, products })
})

router.get('/:id', async (req, res) => {
  const product = mongoose.isValidObjectId(req.params.id) && (await Product.findById(req.params.id).lean())
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
  res.json({ success: true, product })
})

// body: { name, description, price, image: [url], category, subCategory, sizes: [..], bestseller }
router.post('/add', adminAuth, async (req, res) => {
  const { name, description, price, image, category, subCategory, sizes, bestseller } = req.body ?? {}
  try {
    const product = await Product.create({
      name, description, price: Number(price), image, category, subCategory, sizes, bestseller: Boolean(bestseller),
    })
    res.status(201).json({ success: true, product })
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) return res.status(400).json({ success: false, message: err.message })
    throw err
  }
})

router.post('/remove', adminAuth, async (req, res) => {
  const { id } = req.body ?? {}
  const removed = mongoose.isValidObjectId(id) && (await Product.findByIdAndDelete(id))
  if (!removed) return res.status(404).json({ success: false, message: 'Product not found' })
  res.json({ success: true, message: 'Product removed' })
})

export default router
