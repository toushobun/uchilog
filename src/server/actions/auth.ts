"use server";

import { redirect } from "next/navigation";

import { createClient } from "lib/supabase/server";
import { routePaths } from "config/paths";
import type { LoginActionState } from "types/auth";

export async function login(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      error: "请输入邮箱和密码。",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: "邮箱或密码不正确。",
    };
  }

  redirect(routePaths.dashboard);
}
