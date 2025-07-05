const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(
  cors({
    origin: ["https://study-abroad-admin.web.app", "http://localhost:3000"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

app.post("/compile-latex", async (req, res) => {
  try {
    const {
      clientName,
      jobName,
      equipmentName,
      description,
      price,
      invoiceDate,
      notes,
    } = req.body;

    if (
      !clientName ||
      !jobName ||
      !equipmentName ||
      !description ||
      !price ||
      !invoiceDate
    ) {
      console.error("Validation error: Missing required fields", req.body);
      return res
        .status(400)
        .json({ error: "Missing required fields", received: req.body });
    }

    const timestamp = Date.now();
    const outputPath = path.join(
      __dirname,
      "temp",
      `invoice-manual-${timestamp}.pdf`
    );
    const debugPath = path.join(
      __dirname,
      "temp",
      `debug-invoice-${timestamp}.pdf`
    );

    try {
      fs.mkdirSync(path.join(__dirname, "temp"), { recursive: true });
      console.log(
        "Temp directory created/verified:",
        path.join(__dirname, "temp")
      );
    } catch (err) {
      console.error("Failed to create temp directory:", err);
      return res.status(500).json({
        error: "Failed to create temp directory",
        details: err.message,
      });
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const html = `
         <!DOCTYPE html>
         <html>
         <head>
           <style>
             body { font-family: Helvetica, sans-serif; margin: 50px; }
             h1 { text-align: center; }
             .info { margin-bottom: 20px; }
             table { width: 100%; border-collapse: collapse; }
             th, td { border: 1px solid #ddd; padding: 8px; }
             th { font-weight: bold; }
             .right { text-align: right; }
             .notes { margin-top: 20px; font-size: 0.9em; }
           </style>
         </head>
         <body>
           <h1>Invoice</h1>
           <div class="info">
             <p>Client: ${clientName.replace("&", "&")}</p>
             <p>Invoice Date: ${new Date(invoiceDate).toLocaleDateString()}</p>
           </div>
           <table>
             <tr>
               <th>Description</th>
               <th>Job</th>
               <th>Equipment</th>
               <th>Quantity</th>
               <th class="right">Price</th>
             </tr>
             <tr>
               <td>${description}</td>
               <td>${jobName}</td>
               <td>${equipmentName}</td>
               <td>1</td>
               <td class="right">$${parseFloat(price).toFixed(2)}</td>
             </tr>
           </table>
           <p class="right"><strong>Total: $${parseFloat(price).toFixed(
             2
           )}</strong></p>
           ${notes ? `<div class="notes">Notes: ${notes}</div>` : ""}
         </body>
         </html>
       `;

    console.log("Generating PDF with HTML");
    await page.setContent(html);
    await page.pdf({
      path: outputPath,
      format: "A4",
      margin: { top: "50px", right: "50px", bottom: "50px", left: "50px" },
    });

    await browser.close();
    console.log("PDF created at:", outputPath);

    const pdfBuffer = fs.readFileSync(outputPath);
    console.log("PDF buffer size:", pdfBuffer.length);
    fs.copyFileSync(outputPath, debugPath);
    console.log("Debug PDF saved at:", debugPath);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `attachment; filename=invoice-manual-${timestamp}.pdf`,
    });
    res.send(pdfBuffer);
    fs.unlinkSync(outputPath);
    console.log("Temporary PDF deleted:", outputPath);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});
app.options("/compile-latex", (req, res) => {
  res.set({
    "Access-Control-Allow-Origin": "https://study-abroad-admin.web.app",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.status(204).send("");
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
