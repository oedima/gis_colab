import { Router } from 'express'
import { createUser, getHashedPassword } from '../services/users.js'
import { hashPassword, verifyPassword } from '../crypto/password.js'
import { signToken } from '../crypto/jwt.js'

const router = Router()

// POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    console.time("signup")
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' })
    }

    console.time("hashPassword")
    const hashedPassword = await hashPassword(password)
    console.timeEnd("hashPassword")

    console.time("createUser")
    const user = await createUser(email, hashedPassword)
    console.timeEnd("createUser")

    if (!user) return res.status(500).json({ error: 'could not create user' })
    delete (user as any).hashed_password

    console.time("signToken")
    const token = signToken({ email: user.email })
    console.timeEnd("signToken")
    res.json({ user, token })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  } finally {
    console.timeEnd("signup")
  }
})

// POST /auth/signin
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

    const token = signToken({ email })
    res.json({ token })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
