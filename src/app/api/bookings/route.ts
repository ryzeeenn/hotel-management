import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateBookingNumber, calculateNights } from "@/lib/utils";
import { databaseErrorResponse } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    if (search) {
      const bookings = await prisma.booking.findMany({
        where: {
          bookingNumber: {
            contains: search,
          },
        },
        orderBy: { createdAt: "desc" },
        include: {
          guest: true,
          room: true,
          roomType: true,
        },
      });
      return NextResponse.json(bookings);
    }

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        guest: true,
        room: { include: { roomType: true } },
      },
    });
    return NextResponse.json(bookings);
  } catch (error: unknown) {
    return databaseErrorResponse(error, "Gagal memuat booking");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      guestId,
      roomId,
      roomTypeId,
      checkIn,
      checkOut,
      adults,
      children,
      totalPrice,
      specialRequest,
    } = body;

    if (
      !guestId ||
      !roomId ||
      !roomTypeId ||
      !checkIn ||
      !checkOut ||
      !totalPrice
    ) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { roomType: true },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Kamar tidak ditemukan" },
        { status: 404 },
      );
    }

    if (room.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Kamar tidak tersedia" },
        { status: 400 },
      );
    }

    const nights = calculateNights(new Date(checkIn), new Date(checkOut));
    if (nights <= 0) {
      return NextResponse.json(
        { error: "Tanggal check-out harus setelah check-in" },
        { status: 400 },
      );
    }

    const calculatedTotal = room.pricePerNight * nights;

    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          bookingNumber: generateBookingNumber(),
          guestId,
          roomId,
          roomTypeId,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          adults: adults || 1,
          children: children || 0,
          totalPrice: calculatedTotal,
          status: "CONFIRMED",
          specialRequest: specialRequest || null,
        },
      });

      await tx.room.update({
        where: { id: roomId },
        data: { status: "RESERVED" },
      });

      await tx.payment.create({
        data: {
          paymentNumber: `PAY${Date.now()}`,
          bookingId: newBooking.id,
          amount: calculatedTotal,
          paymentMethod: "CASH",
          paymentStatus: "PENDING",
        },
      });

      return newBooking;
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: unknown) {
    return databaseErrorResponse(error, "Gagal membuat booking");
  }
}
