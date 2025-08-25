import jwt, { SignOptions } from 'jsonwebtoken'

const SECRET: string = process.env.JWT_SECRET!
const EXPIRES_IN = process.env.JWT_EXPIRES_IN! as jwt.SignOptions['expiresIn'];

// Define what your payload looks like
export interface AuthPayload {  
  email: string
}

export function signToken(payload: AuthPayload): string {
  const options: SignOptions = { expiresIn: EXPIRES_IN }
  return jwt.sign(payload, SECRET, options)
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, SECRET) as AuthPayload
}
