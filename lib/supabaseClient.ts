import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkvgflhjcnkythytbkuj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrdmdmbGhqY25reXRoeXRia3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NDM4OTYsImV4cCI6MjA3MDAxOTg5Nn0.X9CM27REAKqjD82jAgZEKRGTo0LTkUpI8Df5feUOxww';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
