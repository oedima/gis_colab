import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken'

const SECRET: string = process.env.JWT_SECRET!
const EXPIRES_IN: number = Number(process.env.JWT_EXPIRES_IN!);
const ABOUT_TO_EXPIRE_DURATION: number = Number(process.env.JWT_ABOUT_TO_EXPIRE_DURATION)


export enum TokenState{
    Invalid,
    Valid
}

export interface TokenStatus{
    state: TokenState;
    expired?: boolean;
    aboutToExpire?: boolean;
}

export function signToken(payload: string): string {
    const options: SignOptions = { expiresIn: EXPIRES_IN }
    return jwt.sign({payload}, SECRET, options)
}

export function verifyToken(token: string): TokenStatus {
    try {
        jwt.verify(token, SECRET)
        const decoded = jwt.decode(token);

        if (!decoded || typeof decoded !== "object" || !("exp" in decoded)) 
            return  {state: TokenState.Invalid};                

        const payload = decoded as JwtPayload;
        const expirationTime = payload.exp;

        if (!expirationTime)
            return  {state: TokenState.Invalid};

        const nowSec = Math.floor(Date.now() / 1000);
        if (expirationTime - nowSec < ABOUT_TO_EXPIRE_DURATION)
            return  {state: TokenState.Valid, aboutToExpire: true};
        
        return  {state: TokenState.Valid, aboutToExpire: false};
    }    
    catch (err: any){
        if (err.name === "TokenExpiredError") 
            return {state: TokenState.Invalid, expired: true};
        else 
            return  {state: TokenState.Invalid};
    }
}


