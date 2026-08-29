"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, CheckCircle2, AlertTriangle, Clock, ShoppingBag, Loader2, Building2 } from "lucide-react";

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  deadline: string;
  status: string;
  totalAmount: number;
}

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber || `#${o.id.slice(0, 5)}`,
            customerName: o.customer?.name || "Standard Customer",
            productName: o.items?.[0]?.product?.name || "Manufacturing Batch",
            quantity: o.items?.[0]?.quantity || 100,
            deadline: o.targetDeadline ? new Date(o.targetDeadline).toLocaleDateString() : "Flexible",
            status: o.status || "PENDING",
            totalAmount: o.totalAmount || 0,
          }));
          setOrders(mapped);
          if (mapped.length > 0) setSelectedOrder(mapped[0].orderNumber);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const totalActive = orders.length;
  const inProduction = orders.filter((o) => o.status === "IN_PROGRESS" || o.status === "CONFIRMED").length;

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter === "All Status") return true;
    return ord.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Track customer orders, production progress, and delivery schedules</p>
        </div>
        <Link
          href="/orders/new"
          className="flex items-center gap-2 rounded-xl bg-[#1B365D] hover:bg-[#142845] px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> New Order
        </Link>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-[#00A8FF]">{totalActive}</div>
          <div className="text-xs font-extrabold text-slate-700">Total Orders</div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-emerald-600">{inProduction}</div>
          <div className="text-xs font-extrabold text-slate-700">In Production</div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-rose-600">0</div>
          <div className="text-xs font-extrabold text-slate-700">Delayed</div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-blue-800">0</div>
          <div className="text-xs font-extrabold text-slate-700">Dispatched Today</div>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search orders, customers..."
          className="w-full sm:w-72 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 focus:border-[#00A8FF] focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-44 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
        >
          <option value="All Status">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Orders Data Table or Empty State */}
      <div className="rounded-3xl bg-white shadow-md border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold text-xs flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#00A8FF]" /> Loading Customer Orders...
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-[#F7F9FC] border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ORDER ID</th>
                  <th className="px-6 py-4">CUSTOMER</th>
                  <th className="px-6 py-4">PRODUCT</th>
                  <th className="px-6 py-4">QTY</th>
                  <th className="px-6 py-4">DEADLINE</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-right">TOTAL AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord.orderNumber)}
                    className={`hover:bg-[#F0F7FF] cursor-pointer transition ${
                      selectedOrder === ord.orderNumber ? "bg-[#F0F7FF]/80 font-bold" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-black text-slate-900">{ord.orderNumber}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{ord.customerName}</td>
                    <td className="px-6 py-4 text-slate-700">{ord.productName}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono">{ord.quantity.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600">{ord.deadline}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-sky-100 text-[#0070C0] border border-sky-200">
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 font-mono">₹{ord.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-sky-50 text-[#00A8FF]">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">No Orders Found</h3>
              <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto">
                No active orders exist in your database. Click New Order to add your first customer order.
              </p>
            </div>
            <Link
              href="/orders/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B365D] text-white text-xs font-black hover:bg-[#142845] transition shadow-sm"
            >
              <Plus className="h-4 w-4 text-[#00A8FF]" /> Create New Order
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
