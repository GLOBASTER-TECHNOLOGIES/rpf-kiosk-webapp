import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Kiosk from "@/models/kiosk.model";

export async function GET(req: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    // console.log("---------------------------------------");
    // console.log("🟧 GET /api/kiosk/verify CALLED");
    // console.log("📥 Received Token from App:", token);

    if (!token) {
      // console.log("❌ Error: Token is missing from URL parameters");
      return NextResponse.json(
        { success: false, message: "Token missing" },
        { status: 400 },
      );
    }

    // Query DB
    // console.log("🔎 Searching DB for qrToken:", token);
    const kiosk = await Kiosk.findOne({ qrToken: token });

    if (!kiosk) {
      // console.log("⛔ FAIL: No Kiosk found with this token.");
      // console.log(
      //   "👉 Suggestion: Token might be expired, overwritten, or never saved.",
      // );

      return NextResponse.json(
        { success: false, message: "Invalid QR" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      data: kiosk,
    });
  } catch (error) {
    console.error("❌ GET Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
