import { supabase } from '../config.js'

export async function createUser(email: string, hashedPassword: string) {
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, hashed_password: hashedPassword }])
    .select()

  if (error) throw error
  return data?.[0]
}

export async function isUserRegistered(email: string) : Promise<boolean> {
  const { data, error } = await supabase
  .from("users")
  .select("id")   
  .eq("email", email)
  .maybeSingle(); 

  if (error) throw error
  return !!data
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