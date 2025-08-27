import { Router } from 'express'
import { createTokenForExistingUser, createTokenForNewUser } from '../services/tokenManager.js'

const router = Router()

// POST /auth/signup
router.post('/signup', async (req, res) => {
    try{
        const { email, password } = req.body
        if (!email || !password) 
            return res.status(400).json({ error: 'email and password required' })        
        
        const token = await createTokenForNewUser(email, password);

        res.json({ token })        
    } 
    catch (err: any) {
        res.status(500).json({ error: err.message })
    }  
})

// POST /auth/signin
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) 
            return res.status(400).json({ error: 'email and password required' })        

        const token = await createTokenForExistingUser(email, password)

        res.json({ token })
    } 
    catch (err: any) {
        res.status(500).json({ error: err.message })
    }  
})

export default router
