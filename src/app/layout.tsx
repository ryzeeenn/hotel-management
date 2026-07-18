import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Grand Hotel — Management System",
  description: "Sistem informasi manajemen hotel terpadu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 lg:p-8 animate-fadeIn">{children}</div>
          </main>
        </div>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
