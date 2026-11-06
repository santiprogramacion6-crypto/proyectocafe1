import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wvzuxqipnhwvvqpgthgt.supabase.co'
const supabaseAnonKey = 'sb_publishable_xJwcii7d0-gAM_tS1Ov4rA_1O44Kiih'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)