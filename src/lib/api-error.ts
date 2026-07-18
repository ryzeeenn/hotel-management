import { NextResponse } from "next/server";

function getErrorDetails(error: unknown): string {
  if (error instanceof Error) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function getErrorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }

  return undefined;
}

export function databaseErrorResponse(error: unknown, fallbackMessage: string) {
  const details = getErrorDetails(error);
  const code = getErrorCode(error);

  console.error(`[Database API] ${fallbackMessage}`, error);

  let message = fallbackMessage;

  if (
    code === "P1001" ||
    /can't reach database server|database server.*not reachable|connection refused/i.test(
      details,
    )
  ) {
    message =
      "Database tidak dapat dihubungi. Pastikan PostgreSQL aktif dan DATABASE_URL sudah benar.";
  } else if (
    code === "P2021" ||
    /table .* does not exist|relation .* does not exist/i.test(details)
  ) {
    message =
      "Tabel database belum tersedia. Jalankan `npm run db:setup` lalu muat ulang aplikasi.";
  } else if (
    code === "P2022" ||
    /column .* does not exist/i.test(details)
  ) {
    message =
      "Struktur database belum sesuai dengan Prisma schema. Jalankan `npm run db:setup`.";
  } else if (/environment variable not found.*DATABASE_URL/i.test(details)) {
    message =
      "DATABASE_URL belum diatur. Salin `.env.example` menjadi `.env` lalu isi koneksi PostgreSQL.";
  }

  return NextResponse.json(
    {
      error: message,
      ...(process.env.NODE_ENV === "development"
        ? { code, details }
        : {}),
    },
    { status: 500 },
  );
}
