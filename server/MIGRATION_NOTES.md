// Compatibility layer: Re-exports the custom API client with the same interface
// All files importing from "@/integrations/supabase/client" will use this
// 
// IMPORTANT: On VPS deployment, replace src/integrations/supabase/client.ts with:
// export { supabase } from "@/lib/api";
//
// Since client.ts is read-only in Lovable, for VPS deployment:
// 1. After cloning to VPS, edit src/integrations/supabase/client.ts
// 2. Replace its contents with: export { supabase } from "../../lib/api";
// 3. Then rebuild: npm run build

// For now, the API client is available at:
// import { supabase } from "@/lib/api";
