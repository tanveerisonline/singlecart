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
  Users,
  MapPin,
  Plus,
  Trash2,
  Edit,
  Home,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AddressForm from "@/components/AddressForm";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showAddressForm, setShowAddressOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const fetchProfileData = async () => {
    if (status !== "authenticated") return;
    try {
      setLoading(true);
      const [profileRes, addressRes] = await Promise.all([
        axios.get("/api/user/profile"),
        axios.get("/api/user/addresses")
      ]);
      setProfile(profileRes.data);
      setAddresses(addressRes.data);
    } catch (error) {
      console.error("Failed to fetch profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile");
    } else if (status === "authenticated") {
      fetchProfileData();
    }
  }, [status, router]);

  const onDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await axios.delete(`/api/user/addresses/${id}`);
      toast.success("Address deleted");
      fetchProfileData();
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const onEditAddress = (address: any) => {
    setEditingAddress(address);
    setShowAddressOpen(true);
  };

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

        {/* Addresses Section */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/5 text-primary rounded-2xl">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Saved Addresses</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage your shipping locations</p>
              </div>
            </div>
            {!showAddressForm && (
              <button 
                onClick={() => {
                  setEditingAddress(null);
                  setShowAddressOpen(true);
                }}
                className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-all shadow-lg shadow-gray-900/10"
              >
                <Plus className="h-4 w-4" /> Add New
              </button>
            )}
          </div>

          {showAddressForm ? (
            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-gray-900 uppercase tracking-tight">
                  {editingAddress ? "Edit Address" : "New Address"}
                </h3>
                <button 
                  onClick={() => setShowAddressOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <AddressForm 
                initialData={editingAddress}
                onSuccess={() => {
                  setShowAddressOpen(false);
                  fetchProfileData();
                }}
                onCancel={() => setShowAddressOpen(false)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                  <MapPin className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold">No addresses saved yet.</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="p-6 rounded-[2rem] border border-gray-100 bg-gray-50/30 hover:border-primary/20 hover:bg-white transition-all group relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400 group-hover:text-primary transition-colors">
                          {addr.label === 'Home' ? <Home className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-[8px] font-black uppercase bg-emerald-500 text-white px-2 py-0.5 rounded shadow-sm">Default</span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => onEditAddress(addr)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteAddress(addr.id)}
                          className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-black text-gray-900 uppercase tracking-tight">{addr.fullName}</p>
                      <p className="text-xs font-medium text-gray-500">{addr.phone}</p>
                      <p className="text-xs font-medium text-gray-500 leading-relaxed mt-2">
                        {addr.street}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
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

function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
