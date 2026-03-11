"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { toast } from "sonner";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // We'll simulate fetching advanced analytics derived from existing data
        const res = await axios.get("/api/admin/dashboard");
        
        // Calculate CLV and mock CAC
        const totalRevenue = res.data.totalRevenue || 0;
        const totalCustomers = res.data.totalCustomers || 1;
        const clv = totalRevenue / totalCustomers;
        
        // Mock CAC (in a real scenario, this comes from marketing spend data)
        const mockMarketingSpend = 500;
        const newCustomersThisMonth = Math.max(1, Math.floor(totalCustomers * 0.2));
        const cac = mockMarketingSpend / newCustomersThisMonth;

        setData({
          ...res.data,
          clv,
          cac,
          roi: (clv / cac).toFixed(2)
        });
      } catch (error) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <RefreshCcw className="h-10 w-10 text-primary animate-spin opacity-20 mb-4" />
        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Crunching numbers...</p>
      </div>
    );
  }

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Advanced Analytics</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Customer Lifetime Value & Acquisition Cost</p>
        </div>
        <button onClick={() => window.location.reload()} className="bg-gray-50 text-gray-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 transition-all">
          <RefreshCcw className="h-4 w-4" /> Refresh Data
        </button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Customer Lifetime Value (CLV)", value: `$${data?.clv?.toFixed(2) || '0.00'}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12.5%" },
          { label: "Customer Acquisition Cost (CAC)", value: `$${data?.cac?.toFixed(2) || '0.00'}`, icon: Activity, color: "text-rose-600", bg: "bg-rose-50", trend: "-2.4%" },
          { label: "CLV to CAC Ratio", value: `${data?.roi || '0'}x`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10", trend: "+1.2x" },
          { label: "Total Customers", value: data?.totalCustomers || 0, icon: Users, color: "text-amber-600", bg: "bg-amber-50", trend: "+5.1%" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-gray-200 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black tracking-widest px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                {stat.trend.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Revenue Over Time</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Last 7 Days</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickFormatter={(val) => `$${val}`} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }}
                  itemStyle={{ color: '#4f46e5' }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Chart */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Sales by Category</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Distribution</p>
            </div>
          </div>
          <div className="h-72 w-full">
            {data?.categoryData && data.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} dx={-10} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm font-bold">
                Not enough data yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
