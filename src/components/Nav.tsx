import Image from "next/image";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { NavMenu } from "@/components/NavMenu";

export async function Nav() {
  const { user, profile } = await getCurrentProfile();

  return (
    <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/brand/logo.png"
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
          priority
        />
        <span className="font-semibold tracking-tight text-blue-700">
          ACE Brain
        </span>
      </Link>

      <NavMenu
        isSignedIn={Boolean(user)}
        isAdmin={profile?.role === "admin"}
        email={user?.email ?? null}
      />
    </nav>
  );
}
