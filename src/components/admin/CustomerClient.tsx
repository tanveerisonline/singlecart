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
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  orders: {
    totalAmount: number;
  }[];
}

interface CustomerClientProps {
  initialCustomers: Customer[];
}

export default function CustomerClient({ initialCustomers }: CustomerClientProps) {
  const [searchTerm, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCustomers = initialCustomers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower)
    );
  });

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
    // Use BCC to protect privacy
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

  return (
    <div className="space-y-8">
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
                            {new Date(customer.createdAt).toLocaleDateString(undefined, {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
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
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-white border border-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:border-primary/20 hover:text-primary transition-all shadow-sm">
                            Activity
                          </button>
                          <button className="p-2.5 bg-white text-gray-400 hover:text-gray-600 rounded-xl border border-gray-100 shadow-sm transition-all">
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
      </div>
    </div>
  );
}
