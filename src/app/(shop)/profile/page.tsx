"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { 
  User, 
  Gift, 
  Copy, 
  CheckCircle2, 
  RefreshCcw,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (status !== "authenticated") return;
      try {
        const res = await axios.get("/api/user/profile");
        setProfile(res.data);
      } catch (error) {
        console.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [status]);

  const copyToClipboard = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(profile.referralCode);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCcw className="h-10 w-10 text-primary animate-spin opacity-20 mb-4" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-black border-2 border-primary/20">
            {profile?.name?.[0] || profile?.email?.[0]?.toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{profile?.name || "Customer"}</h1>
            <p className="text-sm text-gray-500 font-medium">{profile?.email}</p>
          </div>
        </div>

        {/* Referral Program */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Referral Program</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Invite friends, earn rewards</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                Share your unique referral code with friends. When they sign up and make their first purchase, you both receive a <span className="font-black text-primary">$10 Gift Card</span>!
              </p>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Referral Code</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 font-mono font-black text-lg text-gray-900 tracking-wider">
                    {profile?.referralCode || "Generating..."}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="h-16 w-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-primary transition-all shadow-xl"
                  >
                    {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex flex-col justify-center items-center text-center space-y-2">
              <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-2">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-3xl font-black text-gray-900">{profile?.referrals?.length || 0}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Friends Referred</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
