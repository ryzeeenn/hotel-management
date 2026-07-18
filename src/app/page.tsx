"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineBuildingOffice2,
  HiOutlineCurrencyDollar,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowRight,
} from "react-icons/hi2";

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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-hotel-200 border-t-hotel-600 mx-auto mb-4" />
          <p className="text-gray-500">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineBuildingOffice2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-red-800 mb-2">{error}</h2>
            <p className="text-red-600 text-sm mb-6">
              Silakan periksa koneksi database dan pastikan server database sedang berjalan.
            </p>
            <button
              onClick={() => { setLoading(true); setError(""); fetchDashboardData(); }}
              className="btn-primary"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Booking",
      value: stats.totalBookings,
      icon: HiOutlineCalendar,
      color: "blue",
      href: "/bookings",
    },
    {
      label: "Total Tamu",
      value: stats.totalGuests,
      icon: HiOutlineUserGroup,
      color: "green",
      href: "/guests",
    },
    {
      label: "Total Kamar",
      value: stats.totalRooms,
      icon: HiOutlineBuildingOffice2,
      color: "purple",
      href: "/rooms",
    },
    {
      label: "Total Pendapatan",
      value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`,
      icon: HiOutlineCurrencyDollar,
      color: "yellow",
      href: "/payments",
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="animate-fadeIn">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-hotel-500 to-hotel-700 rounded-xl flex items-center justify-center shadow-lg">
            <HiOutlineArrowTrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Ringkasan operasional hotel hari ini</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`stat-card-${stat.color} card-hover cursor-pointer animate-fadeIn stagger-${index + 1}`}
              onClick={() => router.push(stat.href)}
            >
              <div className="flex items-start justify-between">
                <div className="relative z-10">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-2 ${
                    stat.color === "blue" ? "text-blue-700" :
                    stat.color === "green" ? "text-green-700" :
                    stat.color === "purple" ? "text-purple-700" :
                    "text-yellow-700"
                  }`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === "blue" ? "bg-blue-100 text-blue-600" :
                  stat.color === "green" ? "bg-green-100 text-green-600" :
                  stat.color === "purple" ? "bg-purple-100 text-purple-600" :
                  "bg-yellow-100 text-yellow-600"
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs text-gray-500">
                <span>Lihat detail</span>
                <HiOutlineArrowRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div className="animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Booking Terbaru</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Daftar pemesanan kamar terbaru
            </p>
          </div>
          <button
            onClick={() => router.push("/bookings")}
            className="btn-secondary text-sm"
          >
            Lihat Semua
          </button>
        </div>

        <div className="card-premium overflow-hidden p-0">
          {recentBookings.length === 0 ? (
            <div className="p-12 text-center">
              <HiOutlineCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada booking</p>
              <p className="text-gray-400 text-sm mt-1">
                Booking pertama akan muncul di sini
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentBookings.map((booking: any, index: number) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-hotel-100 rounded-xl flex items-center justify-center">
                      <HiOutlineCalendar className="w-5 h-5 text-hotel-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 font-mono text-sm">
                        {booking.bookingNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.guest?.firstName} {booking.guest?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Rp {booking.totalPrice?.toLocaleString("id-ID")}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      booking.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" :
                      booking.status === "CHECKED_IN" ? "bg-green-100 text-green-800" :
                      booking.status === "CHECKED_OUT" ? "bg-gray-100 text-gray-800" :
                      booking.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}