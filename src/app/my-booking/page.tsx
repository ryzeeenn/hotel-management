"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/Badge";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineCalendar,
  HiOutlineBuildingOffice,
  HiOutlineUser,
} from "react-icons/hi2";
import { toast } from "sonner";

declare global {
  interface Window {
    snap?: any;
  }
}

function MyBookingContent() {
  const searchParams = useSearchParams();
  const bookingNumber = searchParams.get("number");

  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(bookingNumber || "");

  useEffect(() => {
    if (searchQuery) {
      fetchBookings();
    }
  }, [searchQuery]);

  async function fetchBookings() {
    try {
      const res = await fetch(`/api/bookings?search=${searchQuery}`);
      const data = await res.json();
      setBookings(data);

      const paymentRes = await fetch("/api/payments");
      const allPayments = await paymentRes.json();
      const bookingPayments = allPayments.filter((p: any) =>
        data.some((b: any) => b.id === p.bookingId),
      );
      setPayments(bookingPayments);
    } catch {
      toast.error("Gagal memuat data booking");
    } finally {
      setLoading(false);
    }
  }

  async function handlePay(paymentId: string) {
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: () => {
            toast.success("Pembayaran berhasil!");
            fetchBookings();
          },
          onPending: () => {
            toast.info("Menunggu pembayaran...");
            fetchBookings();
          },
          onError: () => {
            toast.error("Pembayaran gagal");
            fetchBookings();
          },
          onClose: () => {
            fetchBookings();
          },
        });
      } else {
        window.location.href = data.redirectUrl;
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal memproses pembayaran");
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Masukkan nomor booking");
      return;
    }
    setLoading(true);
    fetchBookings();
  }

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotel-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hotel-50 to-hotel-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-hotel-950 font-bold text-xl">G</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Grand Hotel</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Cek Booking Anda
          </h2>
          <p className="text-gray-600 mb-6">
            Masukkan nomor booking untuk melihat detail pemesanan
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => (window.location.href = "/book-now")}
              className="text-hotel-600 hover:text-hotel-700 font-medium text-sm"
            >
              ← Pesan Kamar
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="text-hotel-600 hover:text-hotel-700 font-medium text-sm"
            >
              Login Admin
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan nomor booking (contoh: BK20260705001)"
                className="input-field pl-10"
              />
            </div>
            <button type="submit" className="btn-primary">
              Cari
            </button>
          </form>
        </div>

        {bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const payment = payments.find((p) => p.bookingId === booking.id);

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <div className="bg-hotel-600 text-white px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Nomor Booking</p>
                        <p className="text-xl font-bold font-mono">
                          {booking.bookingNumber}
                        </p>
                      </div>
                      <Badge status={booking.status} />
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <HiOutlineUser className="w-5 h-5 text-hotel-600" />
                          <h3 className="font-semibold text-gray-900">
                            Data Tamu
                          </h3>
                        </div>
                        <p className="text-gray-700 font-medium">
                          {booking.guest?.firstName} {booking.guest?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.guest?.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.guest?.phone}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <HiOutlineBuildingOffice className="w-5 h-5 text-hotel-600" />
                          <h3 className="font-semibold text-gray-900">
                            Detail Kamar
                          </h3>
                        </div>
                        <p className="text-gray-700 font-medium">
                          Kamar {booking.room?.roomNumber} -{" "}
                          {booking.roomType?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Lantai {booking.room?.floor}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <HiOutlineCalendar className="w-5 h-5 text-hotel-600" />
                          <h3 className="font-semibold text-gray-900">
                            Tanggal Menginap
                          </h3>
                        </div>
                        <p className="text-gray-700">
                          Check-in: {formatDateTime(booking.checkIn)}
                        </p>
                        <p className="text-gray-700">
                          Check-out: {formatDateTime(booking.checkOut)}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Detail Lainnya
                        </h3>
                        <p className="text-gray-700">
                          Dewasa: {booking.adults} orang
                        </p>
                        <p className="text-gray-700">
                          Anak-anak: {booking.children} orang
                        </p>
                        <p className="text-lg font-bold text-hotel-700 mt-2">
                          Total: {formatCurrency(booking.totalPrice)}
                        </p>
                      </div>
                    </div>

                    {payment && (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Informasi Pembayaran
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">
                              Nomor Pembayaran
                            </span>
                            <span className="font-mono font-semibold">
                              {payment.paymentNumber}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">
                              Jumlah
                            </span>
                            <span className="font-bold">
                              {formatCurrency(payment.amount)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">
                              Status
                            </span>
                            <Badge status={payment.paymentStatus} />
                          </div>

                          {payment.paymentStatus === "PENDING" ||
                          payment.paymentStatus === "PROCESSING" ? (
                            <button
                              onClick={() => handlePay(payment.id)}
                              className="w-full mt-4 btn-primary"
                            >
                              Bayar Sekarang
                            </button>
                          ) : payment.paymentStatus === "SUCCESS" ? (
                            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-center font-medium">
                              ✓ Pembayaran Berhasil
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && bookings.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Booking tidak ditemukan</p>
            <p className="text-gray-400 text-sm mt-2">
              Periksa kembali nomor booking Anda
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyBookingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotel-600" />
      </div>
    }>
      <MyBookingContent />
    </Suspense>
  );
}