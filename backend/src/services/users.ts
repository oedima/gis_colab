import { supabase } from '../config.js'

export async function createUser(email: string, hashedPassword: string) {
  const { data, error } = await supabase.rpc('create_user', {
    p_email: email,
    p_hashed_password: hashedPassword
  })

  if (error) throw error
  return data?.[0]
}

export async function getHashedPassword(email: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('hashed_password')
    .eq('email', email)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // PGRST116 = No rows found
      return null
    }
    throw error
  }

  return data?.hashed_password ?? null
}