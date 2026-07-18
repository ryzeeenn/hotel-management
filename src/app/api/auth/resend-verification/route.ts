import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateVerificationToken,
  hashVerificationToken,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_MESSAGE =
  "Jika email terdaftar dan belum diverifikasi, tautan verifikasi akan dikirim.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.isVerified) {
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    const fiveMinutesAfterIssue = new Date(
      Date.now() + (24 * 60 - 5) * 60 * 1000,
    );

    if (
      user.verificationToken &&
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry > fiveMinutesAfterIssue
    ) {
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: hashVerificationToken(verificationToken),
        verificationTokenExpiry,
      },
    });

    const emailResult = await sendVerificationEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      verificationToken,
    );

    if (!emailResult.success) {
      console.error("Failed to resend verification email:", emailResult.error);
      return NextResponse.json(
        { error: "Email verifikasi belum dapat dikirim. Silakan coba lagi." },
        { status: 503 },
      );
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengirim ulang email verifikasi" },
      { status: 500 },
    );
  }
}
