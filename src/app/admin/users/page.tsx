"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Plus, 
  Trash2, 
  Shield, 
  User as UserIcon, 
  Mail, 
  Key, 
  RefreshCcw, 
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Search,
  MoreVertical,
  X,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

const ROLES = [
  { label: "User", value: "USER", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  { label: "Admin", value: "ADMIN", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
  { label: "Store Manager", value: "STORE_MANAGER", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  { label: "Product Manager", value: "PRODUCT_MANAGER", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { label: "Order Manager", value: "ORDER_MANAGER", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.post("/api/admin/users", formData);
      setIsAdding(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "USER",
      });
      fetchUsers();
      toast.success("Staff account created successfully!");
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error(error.response?.data || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteClick = (id: string) => {
    setTargetId(id);
    setIsConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!targetId) return;
    try {
      setSaving(true);
      await axios.delete(`/api/admin/users/${targetId}`);
      fetchUsers();
      toast.success("User deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data || "Something went wrong");
    } finally {
      setSaving(false);
      setIsConfirmOpen(false);
      setTargetId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await axios.patch(`/api/admin/users/${userId}`, { role: newRole });
      fetchUsers();
      toast.success("Role updated successfully!");
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(error.response?.data || "Something went wrong");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onConfirmDelete}
        loading={saving}
        title="Delete User"
        description="Are you sure you want to delete this staff member? They will lose all access to the admin panel immediately."
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 text-sm mt-1">Control access levels and manage administrative accounts.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 rounded-xl flex items-center transition-all shadow-sm font-semibold text-sm ${
            isAdding 
              ? "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50" 
              : "bg-primary text-white hover:opacity-90 shadow-primary/20 shadow-sm"
          }`}
        >
          {isAdding ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Staff
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck className="h-24 w-24 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3">
              <UserIcon className="h-5 w-5" />
            </div>
            Create Staff Account
          </h2>
          <form onSubmit={handleAdd} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-medium"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-medium"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Temporary Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">System Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none cursor-pointer text-sm font-medium"
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-8 py-2.5 rounded-xl hover:opacity-90 transition-all font-bold text-sm shadow-sm shadow-primary/20 flex items-center disabled:bg-primary/30"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-gray-100">
          <div className="relative">
            <RefreshCcw className="h-12 w-12 animate-spin text-primary opacity-20" />
            <ShieldCheck className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-400 text-sm font-bold mt-4 animate-pulse uppercase tracking-widest">Loading staff data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96 group">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search staff by name or email..." 
                className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Staff:</span>
              <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{users.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-6 py-4">Staff Member</th>
                  <th className="px-6 py-4">Access Level</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-gray-400 text-sm italic">
                      No administrative staff found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const roleInfo = ROLES.find(r => r.value === user.role) || ROLES[0];
                    const initials = (user.name?.[0] || user.email[0]).toUpperCase();
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`h-10 w-10 rounded-full ${roleInfo.bg} ${roleInfo.color} flex items-center justify-center font-bold text-sm border ${roleInfo.border}`}>
                              {initials}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{user.name || "N/A"}</div>
                              <div className="text-[10px] text-gray-500 flex items-center font-medium mt-0.5 uppercase tracking-tighter">
                                <Mail className="h-3 w-3 mr-1" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="relative inline-block group/select">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className={`appearance-none text-[10px] font-bold px-3 py-1.5 rounded-lg border-none outline-none cursor-pointer pr-8 ring-1 ring-inset ${roleInfo.bg} ${roleInfo.color} ${roleInfo.border} hover:opacity-80 transition-all`}
                            >
                              {ROLES.map(role => (
                                <option key={role.value} value={role.value} className="bg-white text-gray-900">{role.label}</option>
                              ))}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                              <svg className="w-2.5 h-2.5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString(undefined, {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onDeleteClick(user.id)}
                              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-center">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <ShieldAlert className="h-3 w-3" />
              Role changes take effect upon next login
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
