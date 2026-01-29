import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import crypto from "crypto";
import { connect } from "@/dbconfig/db";
import Kiosk from "@/models/kiosk.model";

export async function POST(req: NextRequest) {
  try {
    await connect();

    const { kioskCode } = await req.json();

    const kiosk = await Kiosk.findOne({ kioskCode });
    if (!kiosk) {
      return NextResponse.json(
        { success: false, message: "Kiosk not found" },
        { status: 404 }
      );
    }

    // Generate secure token
    const qrToken = crypto.randomUUID();

    kiosk.qrToken = qrToken;
    await kiosk.save();

    // QR will only contain token
    const qrData = `${process.env.NEXT_PUBLIC_APP_URL}/kiosk/verify?token=${qrToken}`;

    const qrImage = await QRCode.toDataURL(qrData);

    return NextResponse.json({
      success: true,
      qrToken,
      qrImage, // base64 image
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
