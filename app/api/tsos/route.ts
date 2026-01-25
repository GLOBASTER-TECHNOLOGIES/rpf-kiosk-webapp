import { connect } from "@/dbconfig/db";
import Incident from "@/models/incident.model";
import { sendNotification } from "@/utils/sendNotification";
import { NextRequest, NextResponse } from "next/server";
import Twilio from "twilio";
import Device from "@/models/device.model";

export async function POST(req: NextRequest) {
  await connect();
  try {
    const formData = await req.formData();
    const issue_type = formData.get("issue_type");
    const phone_number = formData.get("phone_number");
    const station = formData.get("station");
    const audio_url = formData.get("audio_url");

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = Twilio(accountSid, authToken);

    const status = "OPEN";
    const notificationMessage = `New incident reported${
      issue_type ? " " + issue_type : ""
    } at ${station}.`;
    const devices = await Device.find()
      .sort({ createdAt: -1 })
      .select("device_token");
    // const tokens = devices.map(device => device.device_token);
    const tokens = [
      "cUXsJcKRRmCe89dLaSJ_Wm:APA91bGAuBxaga0O16uj-PiUSupXAjMrUpUZiQ3Sp63eg2Yx4J9x508PCQN51z8Atk55weIJLmuku1BzT711Nh9NwhJ16Zeaqr-Douv0iL0CygGguJZIIt8",
    ];
    // const latestDevice = await Device.findOne().sort({ createdAt: -1 });

    console.log("Sending notification");

    let mediaUrlToSend: string[] | undefined = undefined;
    if (typeof audio_url === "string") {
      mediaUrlToSend = [audio_url];
    }

    if (issue_type === "EMERGENCY") {
      // data saving to db
      // const newIncident = new Incident({
      //   issue_type,
      //   station,
      //   audio_url,
      // });
      // await newIncident.save();

      sendNotification(tokens, notificationMessage);

      const formattedBody = `
      New Incident Report Submitted:

      Issue: ${issue_type}
      Location/Station: ${station}

      Please take immediate action.
    `;

      return NextResponse.json(
        { message: "message successfully sent", success: true },
        { status: 200 }
      );
    }

    if (issue_type) {
      // data saving to db
      // const newIncident = new Incident({
      //   issue_type,
      //   phone_number,
      //   station,
      //   status,
      //   audio_url,
      // });
      // await newIncident.save();

      // const latestDevice = await Device.findOne().sort({ createdAt: -1 });
      sendNotification(tokens, notificationMessage);

      const formattedBody = `
      New Incident Report Submitted:

      Issue: ${issue_type}
      Call now: ${phone_number}
      Location/Station: ${station}

      Please take immediate action.
    `;
    }

    return NextResponse.json(
      { message: "message successfully sent", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error sending message:", error);
    return NextResponse.json(
      { message: "some error in sos backend", success: false },
      { status: 400 }
    );
  }
}
