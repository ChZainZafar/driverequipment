const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2/options");
const admin = require("firebase-admin");
const puppeteer = require("puppeteer");
const chromium = require("@sparticuz/chromium");

admin.initializeApp();

setGlobalOptions({
  region: "us-central1",
  memory: "2GiB",
  timeoutSeconds: 300,
});

exports.generateInvoicePDF = onRequest(async (req, res) => {
  const allowedOrigin = "https://study-abroad-admin.web.app";

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.set({
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "3600",
    });
    return res.status(204).send(""); // No content
  }

  res.set("Access-Control-Allow-Origin", allowedOrigin);

  if (req.method !== "POST") {
    return res.status(405).send("Only POST method allowed");
  }

  const {
    clientName,
    jobName,
    equipmentName,
    description,
    price,
    invoiceDate,
    notes,
  } = req.body;

  if (!clientName || !jobName || !price || !invoiceDate) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #333; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          td, th { border: 1px solid #ccc; padding: 8px; }
        </style>
      </head>
      <body>
        <h1>Invoice</h1>
        <div class="section"><span class="label">Client:</span> ${clientName}</div>
        <div class="section"><span class="label">Job:</span> ${jobName}</div>
        <div class="section"><span class="label">Equipment:</span> ${equipmentName}</div>
        <div class="section"><span class="label">Invoice Date:</span> ${invoiceDate}</div>
        <div class="section"><span class="label">Notes:</span> ${notes}</div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${description}</td>
              <td>$${price}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();
    console.log("Generated PDF size:", pdfBuffer.length);
    console.log("PDF buffer sample:", pdfBuffer.slice(0, 4).toString("hex"));
    res.set({
      "Access-Control-Allow-Origin": allowedOrigin,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${clientName}.pdf"`,
    });

    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation failed:", error);
    res.status(500).send("Error generating PDF");
  }
});
