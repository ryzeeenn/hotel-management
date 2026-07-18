"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import {
  HiOutlineCreditCard,
  HiOutlineMagnifyingGlass,
  HiOutlineCurrencyDollar,
  HiOutlineArrowDownTray,
} from "react-icons/hi2";

interface Payment {
  id: string;
  paymentNumber: string;
  amount: number;
  paymentStatus: string;
  paymentMethod: string;
  paidAt?: string;
  booking?: {
    bookingNumber: string;
    guest?: {
      firstName: string;
      lastName: string;
    };
  };
  order?: {
    orderNumber: string;
    guest?: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Gagal memuat data pembayaran");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: Array.isArray(payments) ? payments.length : 0,
    success: Array.isArray(payments)
      ? payments.filter((p) => p.paymentStatus === "SUCCESS").length
      : 0,
    pending: Array.isArray(payments)
      ? payments.filter((p) => p.paymentStatus === "PENDING").length
      : 0,
    failed: Array.isArray(payments)
      ? payments.filter((p) => p.paymentStatus === "FAILED").length
      : 0,
    totalRevenue: Array.isArray(payments)
      ? payments
          .filter((p) => p.paymentStatus === "SUCCESS")
          .reduce((sum, p) => sum + p.amount, 0)
      : 0,
  };

  function getStatusColor(status: string) {
    const colors: { [key: string]: string } = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      SUCCESS: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  function getStatusLabel(status: string) {
    const labels: { [key: string]: string } = {
      PENDING: "Menunggu",
      PROCESSING: "Diproses",
      SUCCESS: "Berhasil",
      FAILED: "Gagal",
    };
    return labels[status] || status;
  }

  function getMethodLabel(method: string) {
    const labels: { [key: string]: string } = {
      CASH: "Tunai",
      CREDIT_CARD: "Kartu Kredit",
      DEBIT_CARD: "Kartu Debit",
      BANK_TRANSFER: "Transfer Bank",
      E_WALLET: "E-Wallet",
      QRIS: "QRIS",
    };
    return labels[method] || method;
  }

  function downloadPDF() {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("Grand Hotel", 14, 20);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Laporan Keuangan", 14, 28);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, 14, 35);

    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Ringkasan:", 14, 46);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Total Pembayaran: ${stats.total}`, 20, 53);
    doc.text(`Berhasil: ${stats.success}`, 20, 59);
    doc.text(`Menunggu: ${stats.pending}`, 20, 65);
    doc.text(`Gagal: ${stats.failed}`, 20, 71);
    doc.text(`Total Pendapatan: Rp ${stats.totalRevenue.toLocaleString("id-ID")}`, 20, 77);

    const tableData = Array.isArray(payments)
      ? payments.map((p) => [
          p.paymentNumber,
          p.booking?.bookingNumber || p.order?.orderNumber || "-",
          `${p.booking?.guest?.firstName || ""} ${p.booking?.guest?.lastName || ""}`.trim() ||
            `${p.order?.guest?.firstName || ""} ${p.order?.guest?.lastName || ""}`.trim() ||
            "-",
          `Rp ${p.amount.toLocaleString("id-ID")}`,
          getStatusLabel(p.paymentStatus),
          p.paidAt ? new Date(p.paidAt).toLocaleDateString("id-ID") : "-",
        ])
      : [];

    autoTable(doc, {
      startY: 85,
      head: [["No. Pembayaran", "Booking", "Tamu", "Jumlah", "Status", "Tanggal"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
    });

    doc.save(`Laporan-Keuangan-${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF berhasil diunduh");
  }

  const filtered = Array.isArray(payments)
    ? payments.filter((p) => {
        const guestName =
          `${p.booking?.guest?.firstName || ""} ${p.booking?.guest?.lastName || ""} 
           ${p.order?.guest?.firstName || ""} ${p.order?.guest?.lastName || ""}`.toLowerCase();
        return (
          p.paymentNumber?.toLowerCase().includes(search.toLowerCase()) ||
          guestName.includes(search.toLowerCase()) ||
          p.booking?.bookingNumber
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          p.order?.orderNumber?.toLowerCase().includes(search.toLowerCase())
        );
      })
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-hotel-200 border-t-hotel-600 mx-auto mb-4" />
          <p className="text-gray-500">Memuat data pembayaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
              <HiOutlineCreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manajemen Pembayaran</h1>
              <p className="text-gray-500">Kelola semua transaksi pembayaran</p>
            </div>
          </div>
          <button
            onClick={downloadPDF}
            className="btn-success flex items-center gap-2"
          >
            <HiOutlineArrowDownTray className="w-5 h-5" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="stat-card-blue card-hover animate-fadeIn stagger-1">
          <p className="text-sm font-medium text-gray-600">Total</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">{stats.total}</p>
        </div>
        <div className="stat-card-green card-hover animate-fadeIn stagger-2">
          <p className="text-sm font-medium text-gray-600">Berhasil</p>
          <p className="text-3xl font-bold text-green-700 mt-2">{stats.success}</p>
        </div>
        <div className="stat-card-yellow card-hover animate-fadeIn stagger-3">
          <p className="text-sm font-medium text-gray-600">Menunggu</p>
          <p className="text-3xl font-bold text-yellow-700 mt-2">{stats.pending}</p>
        </div>
        <div className="stat-card-red card-hover animate-fadeIn stagger-4">
          <p className="text-sm font-medium text-gray-600">Gagal</p>
          <p className="text-3xl font-bold text-red-700 mt-2">{stats.failed}</p>
        </div>
        <div className="stat-card-indigo card-hover animate-fadeIn stagger-5">
          <p className="text-sm font-medium text-gray-600">Pendapatan</p>
          <p className="text-2xl font-bold text-indigo-700 mt-2">
            Rp {stats.totalRevenue.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card-premium animate-fadeIn">
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nomor pembayaran, booking, atau nama tamu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12 py-3 text-base"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card-premium p-12 text-center animate-fadeIn">
          <HiOutlineCurrencyDollar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Tidak ada data pembayaran</p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? "Coba gunakan kata kunci lain" : "Belum ada transaksi pembayaran"}
          </p>
        </div>
      ) : (
        <div className="card-premium overflow-hidden p-0 animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="table-header">No. Pembayaran</th>
                  <th className="table-header">Booking/Order</th>
                  <th className="table-header">Tamu</th>
                  <th className="table-header">Jumlah</th>
                  <th className="table-header">Metode</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((payment, index) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 transition-colors animate-fadeIn"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <td className="table-cell">
                      <span className="font-mono font-medium text-gray-900 text-xs">
                        {payment.paymentNumber}
                      </span>
                    </td>
                    <td className="table-cell text-gray-600">
                      {payment.booking?.bookingNumber ||
                        payment.order?.orderNumber ||
                        "-"}
                    </td>
                    <td className="table-cell text-gray-600">
                      {payment.booking?.guest?.firstName}{" "}
                      {payment.booking?.guest?.lastName}
                    </td>
                    <td className="table-cell font-medium text-gray-900">
                      Rp {payment.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="table-cell">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {getMethodLabel(payment.paymentMethod)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.paymentStatus)}`}>
                        {getStatusLabel(payment.paymentStatus)}
                      </span>
                    </td>
                    <td className="table-cell text-gray-600">
                      {payment.paidAt
                        ? new Date(payment.paidAt).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Menampilkan {filtered.length} dari {payments.length} pembayaran
          </div>
        </div>
      )}
    </div>
  );
}