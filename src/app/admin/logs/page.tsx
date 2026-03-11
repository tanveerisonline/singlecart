"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Activity, 
  Search, 
  RefreshCcw, 
  ShieldAlert, 
  User, 
  Clock, 
  Monitor 
} from "lucide-react";
import { toast } from "sonner";

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/logs");
      setLogs(res.data);
    } catch (error) {
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user?.email && log.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Activity Logs</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">System audit trail and security events</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by action or email..."
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-bold transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
                <th className="px-8 py-5">Event</th>
                <th className="px-8 py-5">User</th>
                <th className="px-8 py-5">Device / IP</th>
                <th className="px-8 py-5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <RefreshCcw className="h-8 w-8 animate-spin text-primary mx-auto mb-4 opacity-20" />
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Loading audit trail...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-500 font-bold">No logs found</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-gray-50/50 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          log.action.includes("DELETE") || log.action.includes("FAILED") 
                          ? "bg-rose-50 text-rose-600" 
                          : "bg-gray-100 text-gray-600"
                        }`}>
                          {log.action.includes("DELETE") || log.action.includes("FAILED") ? <ShieldAlert className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 tracking-tight">{log.action}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {log.id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {log.user ? (
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black uppercase">
                            {log.user.name?.[0] || log.user.email?.[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{log.user.name || "Unknown"}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{log.user.role}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs font-bold italic flex items-center gap-2">
                          <User className="h-3 w-3" /> System / Guest
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        {log.device && (
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                            <Monitor className="h-3 w-3 text-gray-400" />
                            <span className="truncate max-w-[150px]">{log.device}</span>
                          </div>
                        )}
                        {log.ipAddress && (
                          <div className="inline-block px-2 py-0.5 bg-gray-100 rounded text-[10px] font-black text-gray-500 font-mono">
                            {log.ipAddress}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-gray-900">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
