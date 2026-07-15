// generateQR.js
const fs = require("fs");
const qr = require("qr-image");

// Function to generate QR code
function generateQRCode(url, outputFile) {
  if (!url) {
    console.error("❌ Please provide a URL as input.");
    process.exit(1);
  }

  try {
    // Generate QR code PNG stream
    const qr_png = qr.image(url, { type: "png", margin: 2, size: 8 });

    // Save to file
    qr_png.pipe(fs.createWriteStream(outputFile));

    console.log(`✅ QR code generated and saved as ${outputFile}`);
  } catch (err) {
    console.error("⚠️ Error generating QR code:", err);
  }
}

// Get URL and output file name from command-line arguments
const url = process.argv[2];
const outputFile = process.argv[3] || "qrcode.png";

// Generate QR code
generateQRCode(url, outputFile);
