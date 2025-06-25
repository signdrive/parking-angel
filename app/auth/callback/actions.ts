"use server";

import { getServerClient } from "@/lib/supabase/server-utils";
import { redirect } from "next/navigation";

export async function exchangeCodeForSession(code: string) {
  const supabase = await getServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Error exchanging code for session:", error);
    return redirect(`/auth/auth-code-error?message=${error.message}`);
  }

  return redirect("/dashboard");
}
