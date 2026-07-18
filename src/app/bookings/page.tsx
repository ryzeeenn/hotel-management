"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
      // FIX: Pastikan data adalah array
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  // FIX: Validasi array sebelum filter
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
            Manajemen Booking
          </h1>
          <p className="text-gray-500 mt-1">Kelola semua pemesanan kamar</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <input
          type="text"
          placeholder="Cari nomor booking, nama tamu, atau nomor kamar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-xl text-center">
          <p className="text-gray-500">Tidak ada data booking</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    No. Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tamu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kamar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Check-out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {booking.bookingNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {booking.guest?.firstName} {booking.guest?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Kamar {booking.room?.roomNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(booking.checkIn).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(booking.checkOut).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Rp {booking.totalPrice.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}
                      >
                        {booking.status}
                      </span>
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
