import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateVerificationToken,
  hashPassword,
  hashVerificationToken,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const phone = String(body.phone || "").trim();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      if (!existingUser.isVerified) {
        return NextResponse.json(
          {
            error: "Email sudah terdaftar tetapi belum diverifikasi",
            email,
            requiresVerification: true,
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        verificationToken: hashVerificationToken(verificationToken),
        verificationTokenExpiry,
      },
    });

    const emailResult = await sendVerificationEmail(
      email,
      `${firstName} ${lastName}`,
      verificationToken,
      new URL(request.url).origin,
    );

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken: null,
          verificationTokenExpiry: null,
        },
      });
    }

    return NextResponse.json(
      {
        message: emailResult.success
          ? "Registrasi berhasil. Silakan cek email untuk verifikasi."
          : "Registrasi berhasil, tetapi email verifikasi belum terkirim. Silakan kirim ulang dari halaman verifikasi.",
        userId: user.id,
        email,
        verificationEmailSent: emailResult.success,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal registrasi" },
      { status: 500 },
    );
  }
}
