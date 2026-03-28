import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    department: { type: String, default: '', trim: true },
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)

app.get('/api/users', async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean()
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch users' })
  }
})

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, department = '' } = req.body
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' })
    }
    const user = await User.create({ name, email, department })
    res.status(201).json(user)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' })
    }
    res.status(400).json({ error: err.message || 'Failed to create user' })
  }
})

app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, department } = req.body
    const update = {}
    if (name !== undefined) update.name = name
    if (email !== undefined) update.email = email
    if (department !== undefined) update.department = department
    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' })
    }
    res.status(400).json({ error: err.message || 'Failed to update user' })
  }
})

app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete user' })
  }
})

const PORT = process.env.PORT || 3001
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test15_users'

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  })
