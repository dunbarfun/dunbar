import { createClient } from '@supabase/supabase-js';

export default createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE as string,
  {
    auth: { persistSession: false },
  }
);
