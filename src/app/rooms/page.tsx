"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineBuildingOffice2,
  HiOutlineHome,
  HiOutlineKey,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";

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
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    {
      label: "Tersedia",
      value: "AVAILABLE",
      count: Array.isArray(rooms)
        ? rooms.filter((r) => r.status === "AVAILABLE").length
        : 0,
      icon: HiOutlineKey,
      color: "green",
    },
    {
      label: "Terisi",
      value: "OCCUPIED",
      count: Array.isArray(rooms)
        ? rooms.filter((r) => r.status === "OCCUPIED").length
        : 0,
      icon: HiOutlineHome,
      color: "red",
    },
    {
      label: "Reserved",
      value: "RESERVED",
      count: Array.isArray(rooms)
        ? rooms.filter((r) => r.status === "RESERVED").length
        : 0,
      icon: HiOutlineBuildingOffice2,
      color: "indigo",
    },
    {
      label: "Maintenance",
      value: "MAINTENANCE",
      count: Array.isArray(rooms)
        ? rooms.filter((r) => r.status === "MAINTENANCE").length
        : 0,
      icon: HiOutlineWrenchScrewdriver,
      color: "yellow",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-hotel-200 border-t-hotel-600 mx-auto mb-4" />
          <p className="text-gray-500">Memuat data kamar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-fadeIn">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
            <HiOutlineBuildingOffice2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Kamar</h1>
            <p className="text-gray-500">Kelola semua kamar hotel</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.value}
              className={`stat-card-${stat.color} card-hover animate-fadeIn stagger-${index + 1}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-2 ${
                    stat.color === "green" ? "text-green-700" :
                    stat.color === "red" ? "text-red-700" :
                    stat.color === "indigo" ? "text-indigo-700" :
                    "text-yellow-700"
                  }`}>
                    {stat.count}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.color === "green" ? "bg-green-100 text-green-600" :
                  stat.color === "red" ? "bg-red-100 text-red-600" :
                  stat.color === "indigo" ? "bg-indigo-100 text-indigo-600" :
                  "bg-yellow-100 text-yellow-600"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(rooms) &&
          rooms.map((room, index) => (
            <div
              key={room.id}
              className="card-premium animate-fadeIn"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    room.status === "AVAILABLE" ? "bg-green-100 text-green-600" :
                    room.status === "OCCUPIED" ? "bg-red-100 text-red-600" :
                    room.status === "RESERVED" ? "bg-yellow-100 text-yellow-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    <HiOutlineBuildingOffice2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Kamar {room.roomNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Lantai {room.floor}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  room.status === "AVAILABLE"
                    ? "bg-green-100 text-green-800"
                    : room.status === "OCCUPIED"
                      ? "bg-red-100 text-red-800"
                      : room.status === "RESERVED"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                }`}>
                  {room.status === "AVAILABLE" ? "Tersedia" :
                   room.status === "OCCUPIED" ? "Terisi" :
                   room.status === "RESERVED" ? "Reserved" :
                   room.status}
                </span>
              </div>
              <div className="space-y-2 mb-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tipe Kamar</span>
                  <span className="text-sm font-medium text-gray-900">
                    {room.roomType?.name || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Kapasitas</span>
                  <span className="text-sm font-medium text-gray-900">
                    {room.roomType?.capacity || "-"} orang
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Harga/malam</span>
                    <span className="text-lg font-bold text-hotel-700">
                      Rp {room.pricePerNight.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {rooms.length === 0 && (
        <div className="card-premium p-12 text-center animate-fadeIn">
          <HiOutlineBuildingOffice2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Tidak ada kamar</p>
          <p className="text-gray-400 text-sm mt-1">Belum ada data kamar yang tersedia</p>
        </div>
      )}
    </div>
  );
}