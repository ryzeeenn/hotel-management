import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateOrderNumber } from "@/lib/utils";
import { databaseErrorResponse } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "menu";

    if (type === "menu") {
      const items = await prisma.menuItem.findMany({
        orderBy: { category: "asc" },
      });
      return NextResponse.json(items);
    }

    if (type === "orders") {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { items: { include: { menuItem: true } } },
      });
      return NextResponse.json(orders);
    }

    return NextResponse.json(
      { error: "Type harus berupa menu atau orders" },
      { status: 400 },
    );
  } catch (error: unknown) {
    return databaseErrorResponse(error, "Gagal memuat data restaurant");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderType, roomNumber, items } = body;

    if (!orderType || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Jenis pesanan dan item diperlukan" },
        { status: 400 },
      );
    }

    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(
          orderType === "ROOM_SERVICE" ? "RS" : "RM",
        ),
        orderType,
        roomNumber,
        totalAmount,
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: { include: { menuItem: true } } },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    return databaseErrorResponse(error, "Gagal membuat pesanan");
  }
}
