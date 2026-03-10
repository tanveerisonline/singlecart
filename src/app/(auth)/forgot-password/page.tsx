"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Mail, 
  ArrowLeft, 
  Loader2, 
  Send 
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setSubmitted(true);
      toast.success("Reset link sent to your email!");
    } catch (error: any) {
      toast.error(error.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-[32px] sm:px-10 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              {submitted 
                ? "Check your email for a reset link." 
                : "Enter your email to receive a password reset link."}
            </p>
          </div>

          {!submitted ? (
            <form className="space-y-6" onSubmit={onSubmit}>
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
                    required
                    placeholder="name@example.com"
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 text-gray-900 text-sm font-bold rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary/20 focus:bg-white transition-all outline-none"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-primary/20 text-xs font-black uppercase tracking-widest text-white bg-gray-900 hover:bg-gray-800 focus:outline-none transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Send Reset Link <Send className="h-4 w-4" /></>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-500 mb-4">
                <Send className="h-8 w-8" />
              </div>
              <p className="text-sm text-gray-600 mb-8">
                If an account exists for {email}, you will receive a password reset link shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
              >
                Didn't receive an email? Try again
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-all group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
