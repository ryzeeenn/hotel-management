"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  HiOutlineCheckCircle,
  HiOutlineEnvelope,
  HiOutlineXCircle,
} from "react-icons/hi2";

type VerificationStatus = "loading" | "pending" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token")?.trim() || "";
  const initialEmail = searchParams.get("email")?.trim().toLowerCase() || "";
  const emailWasSent = searchParams.get("sent") !== "0";

  const [status, setStatus] = useState<VerificationStatus>(
    token ? "loading" : "pending",
  );
  const [message, setMessage] = useState(
    emailWasSent
      ? "Kami telah mengirim tautan verifikasi. Silakan periksa kotak masuk dan folder spam Anda."
      : "Email verifikasi belum terkirim. Gunakan tombol di bawah untuk mencoba lagi.",
  );
  const [email, setEmail] = useState(initialEmail);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("pending");
      return;
    }

    async function verifyEmail() {
      try {
        const res = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
          { cache: "no-store" },
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Gagal verifikasi email");
        }

        setStatus("success");
        setMessage("Email berhasil diverifikasi. Akun Anda sekarang aktif.");
        if (data.email) setEmail(data.email);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Gagal verifikasi email");
      }
    }

    verifyEmail();
  }, [token]);

  async function resendVerification() {
    if (!email) {
      setResendMessage("Masukkan alamat email yang digunakan saat mendaftar.");
      return;
    }

    setResending(true);
    setResendMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim ulang email verifikasi");
      }

      setResendMessage(data.message);
      setStatus("pending");
    } catch (error: any) {
      setResendMessage(
        error.message || "Gagal mengirim ulang email verifikasi",
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hotel-50 to-hotel-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-hotel-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Memverifikasi Email
            </h1>
            <p className="text-gray-600">Mohon tunggu sebentar...</p>
          </>
        )}

        {status === "success" && (
          <>
            <HiOutlineCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifikasi Berhasil
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push("/login")}
              className="btn-primary w-full"
            >
              Ke Halaman Login
            </button>
          </>
        )}

        {(status === "pending" || status === "error") && (
          <>
            {status === "pending" ? (
              <HiOutlineEnvelope className="w-20 h-20 text-hotel-600 mx-auto mb-4" />
            ) : (
              <HiOutlineXCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            )}

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {status === "pending"
                ? "Periksa Email Anda"
                : "Verifikasi Gagal"}
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="text-left space-y-3">
              <label className="label-field">Email Pendaftaran</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input-field"
                placeholder="nama@email.com"
              />
              <button
                type="button"
                onClick={resendVerification}
                disabled={resending}
                className="btn-primary w-full disabled:opacity-50"
              >
                {resending ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}
              </button>
            </div>

            {resendMessage && (
              <p className="mt-4 text-sm text-gray-600">{resendMessage}</p>
            )}

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-5 text-sm text-hotel-600 hover:text-hotel-700 font-semibold"
            >
              Kembali ke Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hotel-50 to-hotel-100 p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-hotel-600" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}