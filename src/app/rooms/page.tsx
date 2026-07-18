"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: string;
  pricePerNight: number;
  roomType?: {
    name: string;
    capacity: number;
  };
}

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      // FIX: Pastikan data adalah array
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }

  // FIX: Validasi array sebelum filter
  const stats = [
    {
      label: "Tersedia",
      value: "AVAILABLE",
      count: Array.isArray(rooms)
        ? rooms.filter((r) => r.status === "AVAILABLE").length
        : 0,
    },
    {
      label: "Terisi",
      value: "OCCUPIED",
      count: Array.isArray(rooms)
        ? rooms.filter((r) => r.status === "OCCUPIED").length
        : 0,
    },
    {
      label: "Reserved",
      value: "RESERVED",
      count: Array.isArray(rooms)
        ? rooms.filter((r) => r.status === "RESERVED").length
        : 0,
    },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Kamar</h1>
          <p className="text-gray-500 mt-1">Kelola semua kamar hotel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.value}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stat.count}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(rooms) &&
          rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Kamar {room.roomNumber}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Lantai {room.floor}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    room.status === "AVAILABLE"
                      ? "bg-green-100 text-green-800"
                      : room.status === "OCCUPIED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {room.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  {room.roomType?.name || "-"}
                </p>
                <p className="text-sm text-gray-600">
                  Kapasitas: {room.roomType?.capacity || "-"} orang
                </p>
                <p className="text-lg font-bold text-blue-600">
                  Rp {room.pricePerNight.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
