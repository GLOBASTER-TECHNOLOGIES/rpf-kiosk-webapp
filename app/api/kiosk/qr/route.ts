import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import crypto from "crypto";
import { connect } from "@/dbconfig/db";
import Kiosk from "@/models/kiosk.model";

export async function POST(req: NextRequest) {
  try {
    await connect();

    const body = await req.json();
    const { kioskCode } = body;

    // console.log("---------------------------------------");
    // console.log("🟦 POST /api/kiosk/qr CALLED");
    // console.log("Looking for KioskCode:", kioskCode);

    // 1. Find the Kiosk
    const kiosk = await Kiosk.findOne({ kioskCode });

    if (!kiosk) {
      // console.log("❌ Error: Kiosk NOT found in DB");
      return NextResponse.json(
        { success: false, message: "Kiosk not found" },
        { status: 404 },
      );
    }
    console.log("✅ Kiosk Found:", kiosk._id);

    // 2. Generate secure token
    const qrToken = crypto.randomUUID();
    console.log("Generated New Token:", qrToken);

    // 3. Update & Save
    kiosk.qrToken = qrToken;
    const savedDoc = await kiosk.save();

    // --- CRITICAL CHECK ---
    // console.log("💾 SAVED DOCUMENT TOKEN:", savedDoc.qrToken);

    if (!savedDoc.qrToken) {
      // console.log("🔴 CRITICAL: 'qrToken' is MISSING in saved document.");
      // console.log("👉 ACTION: You must add 'qrToken: { type: String }' to your Mongoose Schema!");
    } else {
      // console.log("🟢 SUCCESS: Token persisted to database.");
    }

    // 4. Generate QR Data
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    // console.log("🔗 APP URL from ENV:", appUrl);

    if (!appUrl) {
      //  console.log("⚠️ WARNING: NEXT_PUBLIC_APP_URL is undefined! QR will be broken.");
    }

    const qrData = `${appUrl}/kiosk/verify?token=${qrToken}`;
    // console.log("🏁 Final QR Data encoded:", qrData);

    const qrImage = await QRCode.toDataURL(qrData);
    // console.log("---------------------------------------");

    return NextResponse.json({
      success: true,
      qrToken,
      qrImage,
      data: kiosk,
    });
  } catch (error) {
    console.error("❌ POST Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
