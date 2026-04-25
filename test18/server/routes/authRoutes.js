import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() }).lean()
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash })

    return res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Login failed' })
  }
})

export default router
