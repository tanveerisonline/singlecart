import { db } from "@/lib/db";
import { Users, Search, Filter, Mail, Calendar, ShoppingBag, DollarSign, UserPlus, MoreVertical } from "lucide-react";
import Link from "next/link";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: {
      role: "USER",
    },
    include: {
      orders: {
        where: {
          status: { notIn: ["CANCELLED", "REFUNDED"] }
        }
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalCustomers = customers.length;
  const newThisMonth = customers.filter(c => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return new Date(c.createdAt) >= startOfMonth;
  }).length;
  
  const activeCustomers = customers.filter(c => c.orders.length > 0).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage your customer database and their activity.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all text-sm font-semibold flex items-center shadow-sm">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            Email All
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all text-sm font-semibold flex items-center shadow-sm shadow-indigo-100">
            Export List
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Customers", value: totalCustomers, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "New This Month", value: newThisMonth, icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Customers", value: activeCustomers, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-5 shadow-sm">
            <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Customers Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96 group">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-white border border-gray-100 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-xs font-bold flex items-center">
              <Filter className="h-3.5 w-3.5 mr-2 text-gray-400" />
              Segment
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <Users className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">No customers found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);
                  const initials = (customer.name?.[0] || customer.email[0]).toUpperCase();
                  
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                            {initials}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {customer.name || "Customer"}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm font-medium">
                            {new Date(customer.createdAt).toLocaleDateString(undefined, {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm font-bold text-gray-900">{customer.orders.length}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                          <DollarSign className="h-3.5 w-3.5" />
                          {totalSpent.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="inline-flex items-center justify-center h-8 px-4 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            View Activity
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
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
