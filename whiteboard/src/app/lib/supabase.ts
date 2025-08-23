import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPA_PROJECT_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPA_SERVICE_ROLE!; 
export const supabase = createClient(supabaseUrl, supabaseKey);
