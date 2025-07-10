import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.EXPO_PUBLIC_SUPABASE_URL!,
	process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
	{
		auth: {
			persistSession: true,
			autoRefreshToken: true,
		},
	},
);

const supabaseAdmin = createClient(
	process.env.EXPO_PUBLIC_SUPABASE_URL!,
	process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
);

export { supabaseAdmin };
export default supabase;
