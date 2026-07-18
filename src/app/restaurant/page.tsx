"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
            Restaurant & Menu
          </h1>
          <p className="text-gray-500 mt-1">Kelola menu restaurant</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Cari menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "Semua Kategori" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {Array.isArray(filteredMenu) && filteredMenu.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMenu
            .filter((m) => m.isAvailable)
            .map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border p-4"
              >
                {item.image && (
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.category}</p>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {item.description}
                  </p>
                )}
                <p className="text-lg font-bold text-blue-600 mt-2">
                  Rp {item.price.toLocaleString("id-ID")}
                </p>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">Tidak ada menu yang tersedia</p>
        </div>
      )}
    </div>
  );
}
