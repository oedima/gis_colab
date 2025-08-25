import { Router } from 'express'
import { createUser, getHashedPassword } from '../services/users.js'
import { hashPassword, verifyPassword } from '../crypto/password.js'

const router = Router()

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' })
    }

    const hashedPassword = await hashPassword(password)
    const user = await createUser(email, hashedPassword)
    if (user && 'hashed_password' in user) delete (user as any).hashed_password

    res.json({ user })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' })
    }

    const hashed = await getHashedPassword(email)
    if (!hashed) {
      return res.status(401).json({ error: 'invalid credentials' })
    }

    const ok = await verifyPassword(hashed, password)
    if (!ok) {
      return res.status(401).json({ error: 'invalid credentials' })
    }

    res.json({ message: 'signin success' })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
