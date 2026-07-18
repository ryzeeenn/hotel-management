import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/'/g, "&#" + "39;")
    .replace(/"/g, "&" + "quot;");
}

function resolveAppUrl(appUrl?: string): string {
  return (
    appUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    ""
  ).replace(/\/+$/, "");
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationToken: string,
  appUrl?: string,
) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return {
      success: false,
      error: "SMTP_USER dan SMTP_PASSWORD belum dikonfigurasi",
    };
  }

  const baseUrl = resolveAppUrl(appUrl);
  if (!baseUrl) {
    return {
      success: false,
      error: "URL aplikasi belum dikonfigurasi",
    };
  }

  const verificationLink = `${baseUrl}/verify-email?token=${encodeURIComponent(
    verificationToken,
  )}`;
  const safeName = escapeHtml(name);

  const mailOptions = {
    from: `"Grand Hotel" <${process.env.SMTP_FROM_EMAIL || "noreply@grandhotel.com"}>`,
    to: email,
    subject: "Verifikasi Email - Grand Hotel",
    html: [
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">',
      '<div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">',
      '<h1 style="color: white; margin: 0;">🏨 Grand Hotel</h1>',
      '<p style="color: #f0f0f0; margin: 10px 0 0;">Verifikasi Email</p>',
      "</div>",
      '<div style="padding: 30px; background: #f9f9f9;">',
      '<h2 style="color: #1e3a5f; margin-top: 0;">Halo ' + safeName + '!</h2>',
      '<p style="color: #666; line-height: 1.6;">Terima kasih telah mendaftar di Grand Hotel. Untuk mengaktifkan akun Anda, silakan klik tombol di bawah ini:</p>',
      '<div style="text-align: center; margin: 30px 0;">',
      '<a href="' + verificationLink + '" style="background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verifikasi Email</a>',
      "</div>",
      '<p style="color: #666; line-height: 1.6;">Atau salin link ini ke browser Anda:</p>',
      '<p style="background: #f0f0f0; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px; color: #333;">' + verificationLink + "</p>",
      '<div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">',
      '<p style="margin: 0; color: #856404;"><strong>⚠️ Penting:</strong> Link verifikasi ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak mendaftar akun ini, abaikan email ini.</p>',
      "</div>",
      "</div>",
      '<div style="background: #1e3a5f; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">',
      '<p style="color: white; margin: 0; font-size: 12px;">© 2026 Grand Hotel Management System. All rights reserved.</p>',
      "</div>",
      "</div>",
    ].join("\n"),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Email error:", error);
    return { success: false, error: error.message || "Gagal mengirim email" };
  }
}

export async function sendBookingConfirmation(
  guestEmail: string,
  guestName: string,
  bookingNumber: string,
  roomNumber: string,
  checkIn: string,
  checkOut: string,
  totalPrice: number,
) {
  const safeGuestName = escapeHtml(guestName);
  const safeBookingNumber = escapeHtml(bookingNumber);
  const safeRoomNumber = escapeHtml(roomNumber);

  const checkInDate = new Date(checkIn).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const checkOutDate = new Date(checkOut).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedPrice = "Rp " + totalPrice.toLocaleString("id-ID");

  const mailOptions = {
    from: '"Grand Hotel" <' + (process.env.SMTP_FROM_EMAIL || "noreply@grandhotel.com") + ">",
    to: guestEmail,
    subject: "Konfirmasi Booking - " + bookingNumber,
    html: [
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">',
      '<div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">',
      '<h1 style="color: white; margin: 0;">🏨 Grand Hotel</h1>',
      '<p style="color: #f0f0f0; margin: 10px 0 0;">Konfirmasi Booking</p>',
      "</div>",
      '<div style="padding: 30px; background: #f9f9f9;">',
      '<h2 style="color: #1e3a5f; margin-top: 0;">Halo ' + safeGuestName + '!</h2>',
      '<p style="color: #666; line-height: 1.6;">Terima kasih telah memilih Grand Hotel. Booking Anda telah berhasil dibuat dengan detail berikut:</p>',
      '<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">',
      '<h3 style="color: #1e3a5f; margin-top: 0;">📋 Detail Booking</h3>',
      '<table style="width: 100%; border-collapse: collapse;">',
      '<tr><td style="padding: 8px 0; color: #666;">Nomor Booking:</td><td style="padding: 8px 0; font-weight: bold; color: #1e3a5f;">' + safeBookingNumber + "</td></tr>",
      '<tr><td style="padding: 8px 0; color: #666;">Kamar:</td><td style="padding: 8px 0; font-weight: bold;">' + safeRoomNumber + "</td></tr>",
      '<tr><td style="padding: 8px 0; color: #666;">Check-in:</td><td style="padding: 8px 0; font-weight: bold;">' + checkInDate + "</td></tr>",
      '<tr><td style="padding: 8px 0; color: #666;">Check-out:</td><td style="padding: 8px 0; font-weight: bold;">' + checkOutDate + "</td></tr>",
      '<tr><td style="padding: 8px 0; color: #666; border-top: 1px solid #eee;">Total:</td><td style="padding: 8px 0; font-weight: bold; color: #d4af37; border-top: 1px solid #eee; font-size: 18px;">' + formattedPrice + "</td></tr>",
      "</table>",
      "</div>",
      '<div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">',
      '<p style="margin: 0; color: #856404;"><strong>⚠️ Penting:</strong> Silakan lakukan pembayaran untuk mengkonfirmasi booking Anda.</p>',
      "</div>",
      "</div>",
      '<div style="background: #1e3a5f; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">',
      '<p style="color: white; margin: 0; font-size: 12px;">© 2026 Grand Hotel Management System. All rights reserved.</p>',
      "</div>",
      "</div>",
    ].join("\n"),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Booking confirmation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Email error:", error);
    return { success: false, error: error.message || "Gagal mengirim email" };
  }
}