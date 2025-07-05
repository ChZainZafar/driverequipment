const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const doc = new PDFDocument({ size: "A4", margin: 50 });
const outputPath = path.join(__dirname, "temp", "test-local.pdf");
fs.mkdirSync(path.join(__dirname, "temp"), { recursive: true });
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

doc.font("Helvetica").fontSize(20).text("Test PDF", { align: "center" });
doc.end();

stream.on("finish", () => console.log("Test PDF created at:", outputPath));
stream.on("error", (err) => console.error("Test PDF error:", err));
