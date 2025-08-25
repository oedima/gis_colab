import express from 'express'
import { PORT } from './config.js'
import authRouter from './routes/auth.js'

const app = express()
app.use(express.json())
app.use('/auth', authRouter)

// listen on all interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
})
