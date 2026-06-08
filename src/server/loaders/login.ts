import { redirect } from "next/navigation";

import { createClient } from "lib/supabase/server";
import { routePaths } from "config/paths";

export async function redirectIfAuthenticated() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect(routePaths.dashboard);
  }
}
