"use client";

import { useRouter } from "next/navigation";
import { logoutUser } from "../../firebase/auth";
import { useAuth } from "../../hooks/useAuth";

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-cyan-300">
        Loading account...
      </main>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black uppercase italic tracking-[0.35em]">
            <span className="text-white">DOST</span>{" "}
            <span className="text-cyan-400">INDUSTRIES</span>
          </h1>

          <p className="mt-2 text-xs uppercase tracking-[0.35em] text-zinc-500">
            Account Hub
          </p>
        </div>

        <div className="rounded-[28px] border border-cyan-500/25 bg-black/60 p-6 shadow-[0_0_60px_rgba(0,255,255,0.10)] backdrop-blur-xl">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-400">
            My Account
          </p>

          <h2 className="text-2xl font-semibold">
            {profile?.name || user.email}
          </h2>

          <p className="mt-2 text-zinc-400">{user.email}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-400/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                Plan
              </p>
              <p className="mt-2 text-xl font-semibold text-cyan-300">
                {profile?.plan || "FREE"}
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-400/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                Modules
              </p>
              <p className="mt-2 text-xl font-semibold text-cyan-300">
                Heat Input
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-400/25 bg-black/50 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
              Premium
            </p>

            <h3 className="mt-3 text-xl font-semibold">
              Remove advertisements
            </h3>

            <p className="mt-2 text-sm text-zinc-400">
              Upgrade your workspace and support future DOST Industries modules.
            </p>

            <button className="mt-4 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
              Upgrade Soon
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-black/40 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
              Business
            </p>

            <h3 className="mt-3 text-xl font-semibold">
              Equip your welding team
            </h3>

            <p className="mt-2 text-sm text-zinc-400">
              Business licenses and module access for professional welding companies.
            </p>

            <button className="mt-4 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
              Coming Soon
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="mt-8 w-full rounded-xl border border-red-500/30 bg-red-500/10 py-4 text-sm font-bold uppercase tracking-[0.25em] text-red-300"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}