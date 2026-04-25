import express from 'express'
import Product from '../models/Product.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (_req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .lean()
    return res.json(products)
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch products' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email')
      .lean()

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    return res.json(product)
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Invalid product id' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, price, category } = req.body
    if (!name || !description || price === undefined || !category) {
      return res
        .status(400)
        .json({ error: 'name, description, price and category are required' })
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      createdBy: req.user.id,
    })
    return res.status(201).json(product)
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to create product' })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, description, price, category } = req.body
    const update = {}
    if (name !== undefined) update.name = name
    if (description !== undefined) update.description = description
    if (price !== undefined) update.price = price
    if (category !== undefined) update.category = category

    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    return res.json(product)
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to update product' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    return res.status(204).send()
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to delete product' })
  }
})

export default router
