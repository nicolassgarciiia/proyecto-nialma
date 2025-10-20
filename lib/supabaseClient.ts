// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Obtiene las variables de entorno que pusimos en .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// Crea el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)