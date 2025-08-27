import {signToken, verifyToken, TokenState} from "../crypto/jwt.js"
import { hashPassword, verifyPassword } from "../crypto/password.js";
import { createUser, getHashedPassword, isUserRegistered } from "./users.js";

const tokenStore = new Map<string, string>()

export function getOrRefreshToken(email: string, token: string) : string {
    const currentToken = tokenStore.get(email)

    if (currentToken){        
        const tokenStatus = verifyToken(token)

        if (tokenStatus.state === TokenState.Valid){
            if (tokenStatus.aboutToExpire!){
                const freshToken = signToken(token);
                tokenStore.set(email, freshToken);

                return freshToken;
            }
            
            return currentToken;
        }
    }

    throw new Error("Invalid Token")
}

export async function createTokenForNewUser(email: string, password: string) : Promise<string> {
    const hashedPassword = await hashPassword(password)
    const user = await createUser(email, hashedPassword)

    if (!user)
        throw new Error('Failed to create user ${email}')

    const token = signToken(user.email);
    tokenStore.set(email, token);
    
    return token;
}

export async function createTokenForExistingUser(email: string, password: string) : Promise<string> {
    if (! await isUserRegistered(email))
        throw new Error('User ${email} is not registered')

    const hashed = await getHashedPassword(email)
        if (!hashed) 
            throw new Error('invalid credentials')

    const ok = await verifyPassword(hashed, password)
            if (!ok) {
              throw new Error('invalid credentials')
            }            

    const token = signToken(email);
    tokenStore.set(email, token);
    
    return token;
}


