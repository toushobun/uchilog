import { redirect } from "next/navigation";

import { createClient } from "lib/supabase/server";

export async function loadLoginView() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/dashboard");
  }
}
