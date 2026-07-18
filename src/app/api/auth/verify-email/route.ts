import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashVerificationToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token")?.trim();

    if (!token) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });
    }

    const hashedToken = hashVerificationToken(token);
    const user = await prisma.user.findFirst({
      where: {
        isVerified: false,
        verificationTokenExpiry: {
          gt: new Date(),
        },
        OR: [
          { verificationToken: hashedToken },
          // Mendukung token lama yang tersimpan sebelum hashing diterapkan.
          { verificationToken: token },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token tidak valid atau sudah kedaluwarsa" },
        {
          status: 400,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return NextResponse.json(
      { message: "Email berhasil diverifikasi!", email: user.email },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: any) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal verifikasi email" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
