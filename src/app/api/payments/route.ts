import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generatePaymentNumber } from "@/lib/utils";
import { databaseErrorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: { booking: { include: { guest: true } }, order: true },
    });
    return NextResponse.json(payments);
  } catch (error: unknown) {
    return databaseErrorResponse(error, "Gagal memuat pembayaran");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payment = await prisma.payment.create({
      data: {
        paymentNumber: generatePaymentNumber(),
        bookingId: body.bookingId,
        orderId: body.orderId,
        amount: body.amount,
        paymentMethod: body.paymentMethod,
        paymentStatus: "PENDING",
      },
    });
    return NextResponse.json(payment, { status: 201 });
  } catch (error: unknown) {
    return databaseErrorResponse(error, "Gagal membuat pembayaran");
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

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        paymentMethod: body.paymentMethod,
        paymentStatus: body.paymentStatus,
        paidAt: body.paymentStatus === "SUCCESS" ? new Date() : null,
      },
    });
    return NextResponse.json(payment);
  } catch (error: unknown) {
    return databaseErrorResponse(error, "Gagal memproses pembayaran");
  }
}
