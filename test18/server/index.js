import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ message: 'Task 18 Products API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)

app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err.message || 'Unexpected server error' })
})

const PORT = process.env.PORT || 3002
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test18_products'

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in environment.')
  process.exit(1)
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Task 18 API listening on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message)
    process.exit(1)
  })
