import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://muxxspmgiqdcrfvxcpnv.supabase.co'   // ← change this
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11eHhzcG1naXFkY3JmdnhjcG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjIyMTgsImV4cCI6MjA5NDMzODIxOH0.U2Bmk6tu0-ZNGxk3Hx2gqRwHCQ1hh5AmdVwzftSMn4g'                     // ← change this

export const supabase = createClient(supabaseUrl, supabaseAnonKey)