import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbconfig/db";
import Kiosk from "@/models/kiosk.model";

/**
 * 📤 GET – Get all kiosks
 * /api/kiosks
 */
export async function GET() {
  try {
    await connect();

    const kiosks = await Kiosk.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: kiosks.length,
        data: kiosks,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch kiosks",
      },
      { status: 500 },
    );
  }
}

/**
 * 📥 POST – Create / Save kiosk
 * /api/kiosks
 */
export async function POST(req: NextRequest) {
  try {
    await connect();

    const body = await req.json();

    const kiosk = await Kiosk.create(body);

    return NextResponse.json(
      {
        success: true,
        message: "Kiosk saved successfully",
        data: kiosk,
      },
      { status: 201 },
    );
  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save kiosk",
      },
      { status: 500 },
    );
  }
}
