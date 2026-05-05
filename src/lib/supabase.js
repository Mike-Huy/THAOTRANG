import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jhebreoxwuimlqwvjdok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZWJyZW94d3VpbWxxd3ZqZG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Nzc5MzAsImV4cCI6MjA5MDM1MzkzMH0.VSaOSgcEOZEQbiHP8-CxbyxOJPpJkF1gVIdcidb2rk4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Naming convention helper
export const getTableName = (name) => `ttq6_${name}`;
