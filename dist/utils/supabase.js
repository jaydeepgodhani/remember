import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
const supabaseUrl = process.env.SUPABASE_URL || "default_url";
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY || "default_key";
export const supabase = createClient(supabaseUrl, supabaseKey);
//# sourceMappingURL=supabase.js.map