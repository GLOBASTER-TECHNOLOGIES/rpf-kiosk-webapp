import mongoose from "mongoose";

const AudioSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    interval: { type: Number, default: 30 }, // seconds
    pause: { type: Number, default: 5 }, // seconds
    language: {
      type: String,
      enum: ["tamil", "english"],
      default: "tamil",
    },
  },
  { _id: false },
);

const LocationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["PLATFORM", "TICKET_COUNTER", "ENTRANCE"],
      required: true,
    },
    platformNumber: { type: Number, default: null },
  },
  { _id: false },
);

const StationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true }, // TPJ, SRM
  },
  { _id: false },
);

const KioskSchema = new mongoose.Schema(
  {
    kioskCode: {
      type: String,
      required: true,
      unique: true, // e.g. TPJ-PLAT-01
    },

    // --- ADD THIS LINE HERE ---
    qrToken: { type: String },
    // --------------------------

    station: StationSchema,
    location: LocationSchema,

    kioskPhone: { type: String, required: true },

    audio: AudioSchema,

    isActive: { type: Boolean, default: true },

    version: { type: Number, default: 1 },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  },
);

export default mongoose.models.Kiosk || mongoose.model("Kiosk", KioskSchema);