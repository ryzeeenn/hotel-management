"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalGuests: 0,
    totalRooms: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [bookingsRes, guestsRes, roomsRes, paymentsRes] = await Promise.all(
        [
          fetch("/api/bookings"),
          fetch("/api/guests"),
          fetch("/api/rooms"),
          fetch("/api/payments"),
        ],
      );

      const bookings = await bookingsRes.json();
      const guests = await guestsRes.json();
      const rooms = await roomsRes.json();
      const payments = await paymentsRes.json();

      const totalRevenue = Array.isArray(payments)
        ? payments
            .filter((p: any) => p.paymentStatus === "SUCCESS")
            .reduce((sum: number, p: any) => sum + p.amount, 0)
        : 0;

      setStats({
        totalBookings: Array.isArray(bookings) ? bookings.length : 0,
        totalGuests: Array.isArray(guests) ? guests.length : 0,
        totalRooms: Array.isArray(rooms) ? rooms.length : 0,
        totalRevenue,
      });

      setRecentBookings(Array.isArray(bookings) ? bookings.slice(0, 5) : []);
    } catch (error) {
      console.error("Dashboard error:", error);
      setError(
        "Gagal memuat data dashboard. Pastikan database sudah terhubung.",
      );
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">⚠️ {error}</h2>
          <p className="text-red-600 text-sm">
            Silakan periksa koneksi database dan pastikan server database sedang
            berjalan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Ringkasan hotel hari ini</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Booking</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {stats.totalBookings}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Tamu</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {stats.totalGuests}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Kamar</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {stats.totalRooms}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Pendapatan</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            Rp {stats.totalRevenue.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Booking Terbaru
        </h2>
        {recentBookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada booking</p>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((booking: any) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {booking.bookingNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.guest?.firstName} {booking.guest?.lastName}
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
