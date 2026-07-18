"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineCalendar,
  HiOutlineMagnifyingGlass,
  HiOutlineBuildingOffice2,
  HiOutlineUser,
} from "react-icons/hi2";

interface Booking {
  id: string;
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalPrice: number;
  status: string;
  guest?: {
    firstName: string;
    lastName: string;
  };
  room?: {
    roomNumber: string;
  };
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = Array.isArray(bookings)
    ? bookings.filter((b) => {
        const guestName =
          `${b.guest?.firstName || ""} ${b.guest?.lastName || ""}`.toLowerCase();
        return (
          b.bookingNumber?.toLowerCase().includes(search.toLowerCase()) ||
          guestName.includes(search.toLowerCase()) ||
          b.room?.roomNumber?.toLowerCase().includes(search.toLowerCase())
        );
      })
    : [];

  function getStatusColor(status: string) {
    const colors: { [key: string]: string } = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      CHECKED_IN: "bg-green-100 text-green-800",
      CHECKED_OUT: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  function getStatusLabel(status: string) {
    const labels: { [key: string]: string } = {
      PENDING: "Menunggu",
      CONFIRMED: "Dikonfirmasi",
      CHECKED_IN: "Check-in",
      CHECKED_OUT: "Check-out",
      CANCELLED: "Dibatalkan",
    };
    return labels[status] || status;
  }

  const statusCounts = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "PENDING").length,
    confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
    checkedIn: bookings.filter((b) => b.status === "CHECKED_IN").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-hotel-200 border-t-hotel-600 mx-auto mb-4" />
          <p className="text-gray-500">Memuat data booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-fadeIn">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <HiOutlineCalendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Booking</h1>
            <p className="text-gray-500">Kelola semua pemesanan kamar</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card-blue card-hover animate-fadeIn stagger-1">
          <p className="text-sm font-medium text-gray-600">Total Booking</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">{statusCounts.total}</p>
        </div>
        <div className="stat-card-yellow card-hover animate-fadeIn stagger-2">
          <p className="text-sm font-medium text-gray-600">Menunggu</p>
          <p className="text-3xl font-bold text-yellow-700 mt-2">{statusCounts.pending}</p>
        </div>
        <div className="stat-card-indigo card-hover animate-fadeIn stagger-3">
          <p className="text-sm font-medium text-gray-600">Dikonfirmasi</p>
          <p className="text-3xl font-bold text-indigo-700 mt-2">{statusCounts.confirmed}</p>
        </div>
        <div className="stat-card-green card-hover animate-fadeIn stagger-4">
          <p className="text-sm font-medium text-gray-600">Check-in</p>
          <p className="text-3xl font-bold text-green-700 mt-2">{statusCounts.checkedIn}</p>
        </div>
      </div>

      {/* Search */}
      <div className="card-premium animate-fadeIn">
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nomor booking, nama tamu, atau nomor kamar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12 py-3 text-base"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card-premium p-12 text-center animate-fadeIn">
          <HiOutlineCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Tidak ada data booking</p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? "Coba gunakan kata kunci lain" : "Belum ada pemesanan kamar"}
          </p>
        </div>
      ) : (
        <div className="card-premium overflow-hidden p-0 animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="table-header">No. Booking</th>
                  <th className="table-header">Tamu</th>
                  <th className="table-header">Kamar</th>
                  <th className="table-header">Check-in</th>
                  <th className="table-header">Check-out</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((booking, index) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 transition-colors animate-fadeIn"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <td className="table-cell">
                      <span className="font-mono font-medium text-gray-900 text-xs">
                        {booking.bookingNumber}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <HiOutlineUser className="w-4 h-4 text-gray-400" />
                        <span>{booking.guest?.firstName} {booking.guest?.lastName}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <HiOutlineBuildingOffice2 className="w-4 h-4 text-gray-400" />
                        <span>Kamar {booking.room?.roomNumber}</span>
                      </div>
                    </td>
                    <td className="table-cell text-gray-600">
                      {new Date(booking.checkIn).toLocaleDateString("id-ID")}
                    </td>
                    <td className="table-cell text-gray-600">
                      {new Date(booking.checkOut).toLocaleDateString("id-ID")}
                    </td>
                    <td className="table-cell font-medium text-gray-900">
                      Rp {booking.totalPrice.toLocaleString("id-ID")}
                    </td>
                    <td className="table-cell">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Menampilkan {filtered.length} dari {bookings.length} booking
          </div>
        </div>
      )}
    </div>
  );
}