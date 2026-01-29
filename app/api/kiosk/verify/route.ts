import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Kiosk from "@/models/kiosk.model";

export async function GET(req: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token missing" },
        { status: 400 }
      );
    }

    const kiosk = await Kiosk.findOne({ qrToken: token });

    if (!kiosk) {
      return NextResponse.json(
        { success: false, message: "Invalid QR" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: kiosk,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
