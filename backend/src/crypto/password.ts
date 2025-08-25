import argon2 from 'argon2'

export async function hashPassword(plain: string): Promise<string> {
  // Tunable params: raise memory/time costs if your server can handle it
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MiB
    timeCost: 3,         // iterations
    parallelism: 1
  })
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain)
}
