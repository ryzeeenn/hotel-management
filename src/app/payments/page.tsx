"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

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
      // FIX: Pastikan data adalah array
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

  // FITUR DOWNLOAD PDF
  function downloadPDF() {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Laporan Keuangan - Grand Hotel", 14, 20);

    doc.setFontSize(11);
    doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 14, 28);

    // Summary
    doc.setFontSize(12);
    doc.text("Ringkasan:", 14, 38);
    doc.setFontSize(10);
    doc.text(`Total Pembayaran: ${stats.total}`, 20, 45);
    doc.text(`Berhasil: ${stats.success}`, 20, 51);
    doc.text(`Menunggu: ${stats.pending}`, 20, 57);
    doc.text(
      `Total Pendapatan: Rp ${stats.totalRevenue.toLocaleString("id-ID")}`,
      20,
      63,
    );

    // Table
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
      startY: 70,
      head: [
        ["No. Pembayaran", "Booking", "Tamu", "Jumlah", "Status", "Tanggal"],
      ],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Save
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Pembayaran
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola semua transaksi pembayaran
          </p>
        </div>
        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Pembayaran</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Berhasil</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {stats.success}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Menunggu</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {stats.pending}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Pendapatan</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            Rp {stats.totalRevenue.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <input
          type="text"
          placeholder="Cari nomor pembayaran, booking, atau nama tamu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-xl text-center">
          <p className="text-gray-500">Tidak ada data pembayaran</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    No. Pembayaran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Booking/Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tamu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Metode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {payment.paymentNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.booking?.bookingNumber ||
                        payment.order?.orderNumber ||
                        "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.booking?.guest?.firstName}{" "}
                      {payment.booking?.guest?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Rp {payment.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.paymentStatus)}`}
                      >
                        {getStatusLabel(payment.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.paidAt
                        ? new Date(payment.paidAt).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
