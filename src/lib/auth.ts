import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle();
  return { user, profile };
}

export async function requireAdmin(redirectTo = "/admin") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/admin");
  return { supabase, user };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Facebook's embed plugin only accepts canonical video URLs
// (e.g. https://www.facebook.com/{user}/videos/{id}/), not the /share/v/
// shortlinks. Resolve the share URL by following its redirect.
async function resolveFacebookShareUrl(url: string): Promise<string> {
  try {
    const u = new URL(url);
    if (u.hostname !== "www.facebook.com" && u.hostname !== "facebook.com") {
      return url;
    }
    if (!u.pathname.startsWith("/share/")) return url;

    const res = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const location = res.headers.get("location");
    if (!location) return url;
    const resolved = new URL(location, url);
    resolved.search = "";
    return resolved.toString();
  } catch {
    return url;
  }
}

export { slugify, resolveFacebookShareUrl };
