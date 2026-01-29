"use client";

import { useState } from "react";

export default function page() {
  const [kioskCode, setKioskCode] = useState("");
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateQR = async () => {
    if (!kioskCode) {
      setError("Please enter kiosk code");
      return;
    }

    setLoading(true);
    setError("");
    setQrImage(null);

    try {
      const res = await fetch("/api/kiosk/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ kioskCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to generate QR");
      }

      setQrImage(data.qrImage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4 text-center">
          Generate Kiosk QR
        </h1>

        <label className="block text-sm font-medium mb-1">
          Kiosk Code
        </label>
        <input
          type="text"
          placeholder="TPJ-PLAT-01"
          value={kioskCode}
          onChange={(e) => setKioskCode(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring focus:ring-blue-300"
        />

        {error && (
          <p className="text-red-600 text-sm mb-3">{error}</p>
        )}

        <button
          onClick={generateQR}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate QR"}
        </button>

        {qrImage && (
          <div className="mt-6 text-center">
            <p className="text-sm mb-2">Scan this QR from kiosk app</p>
            <img
              src={qrImage}
              alt="Kiosk QR"
              className="mx-auto border rounded-lg p-2"
            />

            <a
              href={qrImage}
              download={`${kioskCode}-qr.png`}
              className="inline-block mt-3 text-blue-600 underline text-sm"
            >
              Download QR
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
