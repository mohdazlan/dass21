"use client";

import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md border border-straw px-4 py-2 font-body text-sm text-charcoal transition hover:border-lacquer hover:text-lacquer"
    >
      Log Keluar
    </button>
  );
}
