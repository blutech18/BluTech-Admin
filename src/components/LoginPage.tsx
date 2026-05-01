import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { login } from "@/server/auth";
import { useAuthStore } from "@/store/auth";
import { Loader2, Lock, Mail, ArrowRight } from "lucide-react";

export function LoginPage() {
  const doLogin = useServerFn(login);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await doLogin({ data: { email, password } });
      if (res.ok) {
        setAuth(true, res.email);
      } else {
        setError(res.error);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 sm:px-6">
      {/* Background Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-sky-500/20 blur-[100px]" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/20 blur-[100px]" />
      <div className="absolute top-0 left-0 h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[80px]" />

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
          <div className="p-8 sm:p-10">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex items-center justify-center">
                <img src="/blutech-logo.png" alt="BluTech" className="h-20 w-20 object-contain drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]" />
              </div>
              <h1 className="font-display text-3xl uppercase tracking-tight text-white sm:text-4xl">BluTech</h1>
              <p className="mt-2 text-sm font-medium uppercase tracking-widest text-sky-400/80">Command Center</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 pl-11 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                    placeholder="admin@blutech.dev"
                  />
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-sky-400" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Password
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 pl-11 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-500/50 focus:bg-black/40 focus:ring-1 focus:ring-sky-500/50"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-sky-400" />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 flex items-center gap-2 animate-in slide-in-from-top-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-6 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
              </button>
            </form>
          </div>
          <div className="border-t border-white/5 bg-black/20 px-8 py-4 text-center">
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
              Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
