"use server";

import { redirect } from "next/navigation";

import { createClient } from "lib/supabase/server";
import { routePaths } from "config/paths";

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect(routePaths.login);
}
