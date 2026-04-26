import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl: string = process.env.SUPABASE_URL || "default_url";
const supabaseKey: string =
  process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY || "default_key";

// console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("NODE_ENV: ", process.env.NODE_ENV);

export const supabase = createClient(supabaseUrl, supabaseKey);
