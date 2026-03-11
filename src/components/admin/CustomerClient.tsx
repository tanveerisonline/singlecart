"use client";

import { useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Calendar, 
  ShoppingBag, 
  DollarSign, 
  UserPlus, 
  MoreVertical,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Copy,
  Trash2,
  X,
  Clock,
  MapPin,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import ConfirmModal from "./ConfirmModal";

interface Customer {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  addresses: any[];
  orders: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: Date;
  }[];
}

interface CustomerClientProps {
  initialCustomers: Customer[];
}

export default function CustomerClient({ initialCustomers }: CustomerClientProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleteing] = useState(false);

  const itemsPerPage = 10;

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower)
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const deleteAddress = async (customerId: string, addressId: string) => {
    if (!confirm("Are you sure you want to remove this address?")) return;
    try {
      await axios.delete(`/api/user/addresses/${addressId}`);
      toast.success("Address removed");
      setCustomers(prev => prev.map(c => {
        if (c.id === customerId) {
          return { ...c, addresses: c.addresses.filter((a: any) => a.id !== addressId) };
        }
        return c;
      }));
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const totalCustomers = initialCustomers.length;
  const newThisMonth = initialCustomers.filter(c => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return new Date(c.createdAt) >= startOfMonth;
  }).length;
  
  const activeCustomers = initialCustomers.filter(c => c.orders.length > 0).length;

  const handleEmailAll = () => {
    if (filteredCustomers.length === 0) {
      toast.error("No customers to email");
      return;
    }
    const emails = filteredCustomers.map(c => c.email).join(",");
    const mailtoLink = `mailto:?bcc=${emails}&subject=Update from ${window.location.hostname}`;
    window.location.href = mailtoLink;
    toast.success(`Opening mail client for ${filteredCustomers.length} customers`);
  };

  const handleExport = () => {
    if (filteredCustomers.length === 0) {
      toast.error("No customers to export");
      return;
    }
    const headers = ["Name", "Email", "Join Date", "Orders Count", "Total Spent"];
    const csvContent = [
      headers.join(","),
      ...filteredCustomers.map(c => {
        const totalSpent = c.orders.reduce((sum, order) => sum + order.totalAmount, 0);
        return [
          `"${c.name || "Customer"}"`,
          `"${c.email}"`,
          `"${new Date(c.createdAt).toLocaleDateString()}"`,
          c.orders.length,
          totalSpent.toFixed(2)
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Customer list exported successfully");
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied to clipboard");
    setOpenMenuId(null);
  };

  const openDeleteModal = (id: string) => {
    setTargetDeleteId(id);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async () => {
    if (!targetDeleteId) return;
    try {
      setIsDeleteing(true);
      await axios.delete(`/api/admin/users/${targetDeleteId}`);
      toast.success("Customer deleted successfully");
      router.refresh();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete customer");
    } finally {
      setIsDeleteing(false);
      setTargetDeleteId(null);
    }
  };

  const viewActivity = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsActivityOpen(true);
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-8 relative">
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Customer"
        description="Are you sure you want to delete this customer? This action cannot be undone."
      />

      {/* Activity Sidebar / Slide-over */}
      {isActivityOpen && selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsActivityOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Customer Activity
              </h2>
              <button onClick={() => setIsActivityOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Profile Overview */}
              <div className="flex flex-col items-center text-center p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <div className="h-20 w-20 rounded-[2rem] bg-white text-primary flex items-center justify-center font-black text-2xl border border-primary/20 shadow-sm mb-4">
                  {(selectedCustomer.name?.[0] || selectedCustomer.email[0]).toUpperCase()}
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{selectedCustomer.name || "Anonymous User"}</h3>
                <p className="text-sm font-bold text-gray-400 mt-1">{selectedCustomer.email}</p>
                <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                  <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Orders</p>
                    <p className="text-lg font-black text-gray-900">{selectedCustomer.orders.length}</p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Spent</p>
                    <p className="text-lg font-black text-emerald-600">${selectedCustomer.orders.reduce((s, o) => s + o.totalAmount, 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Order History Timeline */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Order History</h4>
                {selectedCustomer.orders.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedCustomer.orders.map((order) => (
                      <div key={order.id} className="relative pl-6 pb-6 border-l border-gray-100 last:pb-0">
                        <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/10" />
                        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary/20 transition-all group">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-black text-gray-900 group-hover:text-primary transition-colors">#{order.orderNumber}</span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${
                              order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              order.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-end">
                            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(order.createdAt), "MMM d, yyyy")}
                            </p>
                            <p className="text-sm font-black text-gray-900">${order.totalAmount.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Account Details */}
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Account Details</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <UserPlus className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Registered On</p>
                      <p className="text-xs font-black text-gray-700">{format(new Date(selectedCustomer.createdAt), "MMM d, yyyy HH:mm")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Customer ID</p>
                      <p className="text-[10px] font-mono font-bold text-primary truncate w-40">{selectedCustomer.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-50 bg-gray-50/30">
              <button 
                onClick={() => handleEmailAll()} 
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Contact Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">View and manage your customer database and their activity.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleEmailAll}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold flex items-center shadow-sm"
          >
            <Mail className="h-4 w-4 mr-2 text-primary" />
            Email All
          </button>
          <button 
            onClick={handleExport}
            className="bg-gray-900 text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm font-bold flex items-center shadow-lg shadow-gray-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export List
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Customers", value: totalCustomers, icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "New This Month", value: newThisMonth, icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Customers", value: activeCustomers, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-5 shadow-sm transition-all hover:shadow-md">
            <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Customers Table Container */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gray-50/30">
          <div className="relative w-full sm:w-96 group">
            <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-gray-100 rounded-[18px] py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Found: {filteredCustomers.length}
            </p>
            <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-gray-100">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2 rounded-lg hover:bg-gray-50 hover:text-primary text-gray-400 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="flex items-center justify-center px-3 text-xs font-black text-primary">
                {currentPage} / {totalPages || 1}
              </span>
              <button 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 rounded-lg hover:bg-gray-50 hover:text-primary text-gray-400 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
                <th className="px-8 py-5">Customer Identity</th>
                <th className="px-8 py-5">Join Date</th>
                <th className="px-8 py-5">Activity</th>
                <th className="px-8 py-5">Investment</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center max-w-xs mx-auto">
                      <div className="bg-gray-50 p-6 rounded-full mb-6 border border-gray-100">
                        <Users className="h-10 w-10 text-gray-200" />
                      </div>
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">No Records Found</h3>
                      <p className="text-gray-400 text-xs font-bold mt-2 leading-relaxed">
                        We couldn't find any customers matching your current search criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentCustomers.map((customer) => {
                  const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);
                  const initials = (customer.name?.[0] || customer.email[0]).toUpperCase();
                  
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50/30 transition-all duration-200 group">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-2xl bg-white text-primary flex items-center justify-center font-black text-sm border border-gray-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            {initials}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors uppercase tracking-tight">
                              {customer.name || "Anonymous User"}
                            </div>
                            <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-1 font-bold">
                              <Mail className="h-3 w-3 text-primary/40" />
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2.5 text-gray-500 font-bold text-xs">
                          <Calendar className="h-3.5 w-3.5 text-gray-300" />
                          <span>
                            {format(new Date(customer.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="inline-flex items-center gap-2 bg-gray-100/50 px-3 py-1.5 rounded-xl border border-gray-100">
                          <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-xs font-black text-gray-900">{customer.orders.length} Orders</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1 text-emerald-600 font-black text-sm">
                          <DollarSign className="h-3.5 w-3.5" />
                          {totalSpent.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right relative">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => viewActivity(customer)}
                            className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-white border border-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:border-primary/20 hover:text-primary transition-all shadow-sm"
                          >
                            Activity
                          </button>
                          <div className="relative">
                            <button 
                              onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)}
                              className={`p-2.5 rounded-xl border border-gray-100 shadow-sm transition-all ${openMenuId === customer.id ? 'bg-primary text-white' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            
                            {openMenuId === customer.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                  <button onClick={() => viewActivity(customer)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-primary transition-all">
                                    <Clock className="h-4 w-4" /> View Activity
                                  </button>
                                  <button onClick={() => toggleExpand(customer.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-primary transition-all">
                                    <MapPin className="h-4 w-4" /> Manage Addresses
                                  </button>
                                  <button onClick={() => copyEmail(customer.email)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-primary transition-all">
                                    <Copy className="h-4 w-4" /> Copy Email
                                  </button>
                                  <div className="h-px bg-gray-50 my-1 mx-2" />
                                  <button onClick={() => openDeleteModal(customer.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all">
                                    <Trash2 className="h-4 w-4" /> Delete Account
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                    {expandedId === customer.id && (
                      <tr className="bg-gray-50/50 animate-in fade-in slide-in-from-top-2">
                        <td colSpan={5} className="px-8 py-8 border-b border-gray-100">
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Stored Shipping Locations ({customer.addresses.length})</h4>
                            </div>
                            
                            {customer.addresses.length === 0 ? (
                              <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 border-dashed">
                                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No addresses saved by this user</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {customer.addresses.map((addr: any) => (
                                  <div key={addr.id} className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm relative group/addr">
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">{addr.label}</span>
                                        {addr.isDefault && <span className="text-[8px] font-black uppercase text-emerald-600">Default</span>}
                                      </div>
                                      <button 
                                        onClick={() => deleteAddress(customer.id, addr.id)}
                                        className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover/addr:opacity-100 transition-all"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{addr.fullName}</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">{addr.phone}</p>
                                    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                                      {addr.street}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:text-primary hover:border-primary/50"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${
                      currentPage === page
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:text-primary hover:border-primary/50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
