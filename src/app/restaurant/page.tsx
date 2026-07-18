"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  HiOutlineShoppingBag,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineCheckBadge,
} from "react-icons/hi2";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  isAvailable: boolean;
  image?: string | null;
}

export default function RestaurantPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    filterMenu();
  }, [menuItems, search, category]);

  async function fetchMenuItems() {
    try {
      const res = await fetch("/api/restaurant?type=menu", {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat menu");
      }

      setMenuItems(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error fetching menu:", error);
      toast.error(error.message || "Gagal memuat menu");
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  }

  function filterMenu() {
    let filtered = Array.isArray(menuItems) ? [...menuItems] : [];

    if (category !== "all") {
      filtered = filtered.filter((item) => item.category === category);
    }

    if (search) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    setFilteredMenu(filtered);
  }

  const categories = Array.isArray(menuItems)
    ? ["all", ...Array.from(new Set(menuItems.map((item) => item.category)))]
    : ["all"];

  const availableCount = menuItems.filter((m) => m.isAvailable).length;
  const unavailableCount = menuItems.filter((m) => !m.isAvailable).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-hotel-200 border-t-hotel-600 mx-auto mb-4" />
          <p className="text-gray-500">Memuat menu restaurant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-fadeIn">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
            <HiOutlineShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restaurant & Menu</h1>
            <p className="text-gray-500">Kelola menu restaurant</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card-blue card-hover animate-fadeIn stagger-1">
          <p className="text-sm font-medium text-gray-600">Total Menu</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">{menuItems.length}</p>
        </div>
        <div className="stat-card-green card-hover animate-fadeIn stagger-2">
          <p className="text-sm font-medium text-gray-600">Tersedia</p>
          <p className="text-3xl font-bold text-green-700 mt-2">{availableCount}</p>
        </div>
        <div className="stat-card-red card-hover animate-fadeIn stagger-3">
          <p className="text-sm font-medium text-gray-600">Habis</p>
          <p className="text-3xl font-bold text-red-700 mt-2">{unavailableCount}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card-premium animate-fadeIn">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-12 py-3 text-base"
            />
          </div>
          <div className="relative">
            <HiOutlineFunnel className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field pl-12 py-3 text-base min-w-[180px] appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "Semua Kategori" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      {Array.isArray(filteredMenu) && filteredMenu.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMenu
            .filter((m) => m.isAvailable)
            .map((item, index) => (
              <div
                key={item.id}
                className="card-premium animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {item.image && (
                  <div className="w-full h-40 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                {!item.image && (
                  <div className="w-full h-40 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl mb-4 flex items-center justify-center">
                    <HiOutlineShoppingBag className="w-12 h-12 text-orange-300" />
                  </div>
                )}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                  <HiOutlineCheckBadge className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
                <span className="inline-block px-2.5 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full mb-2">
                  {item.category}
                </span>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xl font-bold text-hotel-700">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="card-premium p-12 text-center animate-fadeIn">
          <HiOutlineShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Tidak ada menu yang tersedia</p>
          <p className="text-gray-400 text-sm mt-1">
            {search || category !== "all"
              ? "Coba ubah filter pencarian"
              : "Belum ada menu yang ditambahkan"}
          </p>
        </div>
      )}
    </div>
  );
}