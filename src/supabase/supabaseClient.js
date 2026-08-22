import { createClient } from '@supabase/supabase-js';

const supabaseUr1 = 'https://bemaosdvlsbfjzsjjxzn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlbWFvc2R2bHNiZmp6c2pqeHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMjkwNDIsImV4cCI6MjEwMDkwNTA0Mn0.rvs8ynbtZfs1ORRyrWyDL4g-jL9ntmOGCGuzg1jFcPQ'

export const supabase = createClient(supabaseUr1, supabaseAnonKey);