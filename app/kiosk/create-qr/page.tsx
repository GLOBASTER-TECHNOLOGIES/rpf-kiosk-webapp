"use client";

import { useState } from "react";

export default function Page() {
  const [kioskCode, setKioskCode] = useState("");
  const [qrImage, setQrImage] = useState(null);
  const [kioskData, setKioskData] = useState(null); // 1. New state for data
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
    setKioskData(null);

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

      // 2. Capture the data returned from the API
      // Ensure your backend returns this data (e.g. { qrImage: "...", data: { ... } })
      setKioskData(data.data || data.kioskData);

    } catch (e) {
      console.log(e)
      setError("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-2xl"> {/* Increased max-width */}
        <h1 className="text-xl font-semibold mb-4 text-center">
          Generate Kiosk QR
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT COLUMN: Input & QR */}
          <div>
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
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 mb-6"
            >
              {loading ? "Generating..." : "Generate QR"}
            </button>

            {qrImage && (
              <div className="text-center border-t pt-6">
                <p className="text-sm mb-2 font-medium text-gray-600">Scan to Configure</p>
                <img
                  src={qrImage}
                  alt="Kiosk QR"
                  className="mx-auto border rounded-lg p-2 w-48 h-48 object-contain"
                />
                <a
                  href={qrImage}
                  download={`${kioskCode}-qr.png`}
                  className="inline-block mt-3 text-blue-600 underline text-sm hover:text-blue-800"
                >
                  Download Image
                </a>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Data Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border h-full">
            <h2 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">
              Payload Preview
            </h2>

            {!kioskData ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                {loading ? "Fetching data..." : "Generated data will appear here"}
              </div>
            ) : (
              <div className="text-xs space-y-2 font-mono text-gray-800">
                {/* This renders the Raw JSON nicely formatted */}
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(kioskData, null, 2)}
                </pre>

                {/* Or simpler specific fields if you prefer: */}
                {/* <p><span className="font-bold">Station:</span> {kioskData.station?.name}</p>
                 <p><span className="font-bold">Audio:</span> {kioskData.audio?.enabled ? 'Enabled' : 'Disabled'}</p>
                 */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}