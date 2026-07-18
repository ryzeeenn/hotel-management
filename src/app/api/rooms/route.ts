import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { databaseErrorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: [{ floor: "asc" }, { roomNumber: "asc" }],
      include: { roomType: true },
    });
    return NextResponse.json(rooms);
  } catch (error: unknown) {
    return databaseErrorResponse(error, "Gagal memuat kamar");
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    const room = await prisma.room.update({
      where: { id },
      data: { status: body.status },
    });
    return NextResponse.json(room);
  } catch (error: unknown) {
    return databaseErrorResponse(error, "Gagal mengubah status kamar");
  }
}
