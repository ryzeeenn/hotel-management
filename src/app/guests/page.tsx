"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  HiOutlineUserGroup,
  HiOutlineMagnifyingGlass,
  HiOutlineStar,
  HiOutlineUser,
} from "react-icons/hi2";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idCardNumber: string;
  nationality: string;
  address: string;
  vipStatus: boolean;
}

export default function GuestsPage() {
  const router = useRouter();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuests();
  }, []);

  async function fetchGuests() {
    try {
      const res = await fetch("/api/guests");
      const data = await res.json();
      setGuests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching guests:", error);
      toast.error("Gagal memuat data tamu");
      setGuests([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = Array.isArray(guests)
    ? guests.filter((g) => {
        const fullName = `${g.firstName} ${g.lastName}`.toLowerCase();
        return (
          fullName.includes(search.toLowerCase()) ||
          g.email.toLowerCase().includes(search.toLowerCase()) ||
          g.phone.includes(search) ||
          g.idCardNumber.includes(search)
        );
      })
    : [];

  const vipCount = guests.filter((g) => g.vipStatus).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-hotel-200 border-t-hotel-600 mx-auto mb-4" />
          <p className="text-gray-500">Memuat data tamu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-fadeIn">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
            <HiOutlineUserGroup className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Tamu</h1>
            <p className="text-gray-500">Kelola data tamu hotel</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card-green card-hover animate-fadeIn stagger-1">
          <p className="text-sm font-medium text-gray-600">Total Tamu</p>
          <p className="text-3xl font-bold text-green-700 mt-2">{guests.length}</p>
        </div>
        <div className="stat-card-yellow card-hover animate-fadeIn stagger-2">
          <p className="text-sm font-medium text-gray-600">VIP</p>
          <p className="text-3xl font-bold text-yellow-700 mt-2">{vipCount}</p>
        </div>
        <div className="stat-card-blue card-hover animate-fadeIn stagger-3">
          <p className="text-sm font-medium text-gray-600">Regular</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">{guests.length - vipCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="card-premium animate-fadeIn">
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, email, telepon, atau nomor KTP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12 py-3 text-base"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card-premium p-12 text-center animate-fadeIn">
          <HiOutlineUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Tidak ada data tamu</p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? "Coba gunakan kata kunci lain" : "Belum ada tamu yang terdaftar"}
          </p>
        </div>
      ) : (
        <div className="card-premium overflow-hidden p-0 animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="table-header">Nama</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Telepon</th>
                  <th className="table-header">No. KTP</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((guest, index) => (
                  <tr
                    key={guest.id}
                    className="hover:bg-gray-50 transition-colors animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-hotel-400 to-hotel-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {guest.firstName[0]}{guest.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {guest.firstName} {guest.lastName}
                          </p>
                          {guest.vipStatus && (
                            <span className="flex items-center gap-1 text-xs text-yellow-600 mt-0.5">
                              <HiOutlineStar className="w-3 h-3" /> VIP
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-gray-600">{guest.email}</td>
                    <td className="table-cell text-gray-600">{guest.phone}</td>
                    <td className="table-cell text-gray-600 font-mono text-xs">{guest.idCardNumber}</td>
                    <td className="table-cell">
                      {guest.vipStatus ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <HiOutlineStar className="w-3 h-3" /> VIP
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Regular
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Menampilkan {filtered.length} dari {guests.length} tamu
          </div>
        </div>
      )}
    </div>
  );
}