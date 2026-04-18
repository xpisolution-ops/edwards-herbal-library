import { createClient } from '@supabase/supabase-js'

// Hardcoded to ensure it works even if Vercel Environment Variables fail to load
const supabaseUrl = 'https://lrxqsfkyczvqhpueeeat.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyeHFzZmt5Y3p2cWhwdWVlZWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0ODIxODgsImV4cCI6MjA5MjA1ODE4OH0.wHUAiFIAruKcvf_OFc8xSoRqZHf_6_qN3pW9waJ3hhU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
