import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(guests);
  } catch (error: unknown) {
    return databaseErrorResponse(error, "Gagal memuat tamu");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const guest = await prisma.guest.create({ data: body });
    return NextResponse.json(guest, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 },
      );
    }

    return databaseErrorResponse(error, "Gagal menambahkan tamu");
  }
}
