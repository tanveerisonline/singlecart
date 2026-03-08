import { db } from "@/lib/db";
import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  UserPlus,
  BarChart3
} from "lucide-react";
import DashboardCharts from "@/components/admin/DashboardCharts";
import Link from "next/link";
import Image from "next/image";

export default async function AdminDashboard() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch aggregate counts and data
  const [
    productCount, 
    orderCount, 
    userCount, 
    pendingOrderCount,
    recentOrders, 
    categories,
    recentUsers,
    lowStockProducts,
    topSellingItems
  ] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.user.count({ where: { role: "USER" } }),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: true }
    }),
    db.category.findMany({
      include: { _count: { select: { products: true } } }
    }),
    db.user.findMany({
      where: { role: "USER" },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    db.product.findMany({
      where: {
        OR: [
          { stock: { lte: db.product.fields.lowStockThreshold } },
          { stock: 0 }
        ]
      },
      take: 5,
      include: { images: { take: 1 } }
    }),
    db.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    })
  ]);

  // Fetch product details for top selling items
  const topProducts = await Promise.all(
    topSellingItems.map(async (item) => {
      const product = await db.product.findUnique({
        where: { id: item.productId },
        include: { images: { take: 1 } }
      });
      return {
        ...product,
        totalSold: item._sum.quantity
      };
    })
  );

  // Calculate revenue statistics
  const allOrders = await db.order.findMany({
    where: { 
      status: { notIn: ["CANCELLED", "REFUNDED"] } 
    },
    select: { totalAmount: true, createdAt: true }
  });
  
  const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  const revenueToday = allOrders
    .filter(o => new Date(o.createdAt) >= startOfToday)
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const revenueThisMonth = allOrders
    .filter(o => new Date(o.createdAt) >= startOfMonth)
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  // Generate revenue data for the chart (last 7 days)
  const revenueData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    const dayTotal = allOrders
      .filter(o => new Date(o.createdAt).toDateString() === d.toDateString())
      .reduce((sum, o) => sum + o.totalAmount, 0);

    revenueData.push({
      name: dateStr,
      total: dayTotal
    });
  }

  // Format category data for the bar chart
  const categoryData = categories
    .map(c => ({
      name: c.name,
      count: c._count.products
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const stats = [
    { 
      label: "Total Revenue", 
      value: `$${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 
      icon: DollarSign, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      description: `$${revenueToday.toLocaleString()} today`
    },
    { 
      label: "Total Orders", 
      value: orderCount.toLocaleString(), 
      icon: ShoppingBag, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      description: `${pendingOrderCount} pending orders`
    },
    { 
      label: "Avg. Order Value", 
      value: `$${avgOrderValue.toFixed(2)}`, 
      icon: BarChart3, 
      color: "text-indigo-600", 
      bg: "bg-indigo-50",
      description: "Based on all orders"
    },
    { 
      label: "Total Customers", 
      value: userCount.toLocaleString(), 
      icon: Users, 
      color: "text-violet-600", 
      bg: "bg-violet-50",
      description: "Active users"
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time overview of your store's performance.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products/new" className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
            Add Product
          </Link>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center text-sm font-medium shadow-sm shadow-indigo-100">
            <TrendingUp className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Quick Alerts - Low Stock */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-amber-100 p-2 rounded-lg mr-4">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-amber-800 font-semibold text-sm">Low Stock Alert</p>
              <p className="text-amber-700 text-xs">{lowStockProducts.length} products are running low on stock or out of stock.</p>
            </div>
          </div>
          <Link href="/admin/inventory" className="text-amber-700 text-sm font-bold hover:underline flex items-center">
            Manage Inventory <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-500 relative z-10">
              <Clock className="h-3 w-3 mr-1" />
              {stat.description}
            </div>
            <div className={`absolute -bottom-4 -right-4 h-20 w-20 rounded-full opacity-5 ${stat.bg}`}></div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <DashboardCharts revenueData={revenueData} categoryData={categoryData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-900 flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2 text-indigo-500" />
              Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-sm text-indigo-600 font-semibold hover:text-indigo-800">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Order</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold text-right">Amount</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">No orders yet</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/admin/orders/${order.id}`} className="font-bold text-gray-900 hover:text-indigo-600">
                          {order.orderNumber}
                        </Link>
                        <p className="text-[10px] text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.user.name || "Guest"}</div>
                        <div className="text-xs text-gray-500">{order.user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-gray-900">${order.totalAmount.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider
                          ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : 
                            order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                            order.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                            'bg-blue-100 text-blue-700'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-emerald-500" />
              Best Sellers
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {topProducts.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No sales data yet</p>
            ) : (
              topProducts.map((product) => (
                <div key={product.id} className="flex items-center group">
                  <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden relative mr-4 flex-shrink-0">
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.name || ""} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300">
                        <Package className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.totalSold} units sold</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-bold text-gray-900">${product.price?.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-gray-50/50 text-center">
            <Link href="/admin/products" className="text-xs font-bold text-gray-500 hover:text-indigo-600 uppercase tracking-wider">
              Inventory Report
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Recent Customers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="font-bold text-gray-900 flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-violet-500" />
              New Customers
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {recentUsers.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No customers yet</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm mr-3">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.name || "Customer"}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-8">
              <Link href="/admin/customers" className="block w-full text-center py-2.5 rounded-xl border border-gray-100 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                View All Customers
              </Link>
            </div>
          </div>
        </div>

        {/* Category Performance / Quick Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
              Category Overview
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {categories.slice(0, 6).map((category) => {
                const percentage = productCount > 0 ? (category._count.products / productCount) * 100 : 0;
                return (
                  <div key={category.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      <span className="text-xs font-bold text-gray-500">{category._count.products} products</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {categories.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">No categories found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
