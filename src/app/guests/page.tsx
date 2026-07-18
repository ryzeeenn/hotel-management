"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
      // FIX: Pastikan data adalah array
      setGuests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching guests:", error);
      toast.error("Gagal memuat data tamu");
      setGuests([]);
    } finally {
      setLoading(false);
    }
  }

  // FIX: Validasi array sebelum filter
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Tamu</h1>
          <p className="text-gray-500 mt-1">Kelola data tamu hotel</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <input
          type="text"
          placeholder="Cari nama, email, telepon, atau nomor KTP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-xl text-center">
          <p className="text-gray-500">Tidak ada data tamu</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Telepon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    No. KTP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {guest.firstName} {guest.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {guest.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {guest.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {guest.idCardNumber}
                    </td>
                    <td className="px-6 py-4">
                      {guest.vipStatus ? (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          VIP
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
        </div>
      )}
    </div>
  );
}
