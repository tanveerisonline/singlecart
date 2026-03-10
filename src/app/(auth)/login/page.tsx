"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Github, 
  Chrome 
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const callback = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (callback?.error) {
        toast.error("Invalid email or password");
      }

      if (callback?.ok && !callback?.error) {
        toast.success("Welcome back!");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const socialAction = (action: string) => {
    setSocialLoading(action);
    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error("Social login failed");
        }
        if (callback?.ok && !callback?.error) {
          toast.success("Logged in successfully");
          router.push("/");
        }
      })
      .finally(() => setSocialLoading(null));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-[32px] sm:px-10 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-500 font-medium">Please enter your details to sign in.</p>
          </div>

          <form className="space-y-5" onSubmit={loginUser}>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 text-gray-900 text-sm font-bold rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary/20 focus:bg-white transition-all outline-none"
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Password
                </label>
                <Link href="/forgot-password" disable-nprogress="true" className="text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 text-gray-900 text-sm font-bold rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary/20 focus:bg-white transition-all outline-none"
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-primary/20 text-xs font-black uppercase tracking-widest text-white bg-primary hover:opacity-90 focus:outline-none transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                <span className="px-4 bg-white text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => socialAction('google')}
                disabled={socialLoading !== null}
                className="w-full flex justify-center items-center gap-3 py-3.5 px-4 bg-white border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
              >
                {socialLoading === 'google' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Chrome className="h-4 w-4 text-rose-500" />
                )}
                Google
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
            New here?{" "}
            <Link href="/register" className="text-primary hover:opacity-70 transition-opacity">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
