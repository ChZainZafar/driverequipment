const functions = require("firebase-functions");
const admin = require("firebase-admin");
const PDFDocument = require("pdfkit");
const moment = require("moment");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

exports.generateInvoicePDF = functions.https.onCall(async (data, context) => {
  try {
    // Verify user is authenticated
    // if (!context.auth) {
    //   throw new functions.https.HttpsError(
    //     "unauthenticated",
    //     "User must be authenticated"
    //   );
    // }

    // Validate required data
    const {
      userId = "test",
      type,
      clientName = "test",
      jobId,
      jobName = "test",
      equipmentId,
      equipmentName = "test",
      description = "test",
      price = 123,
      invoiceDate = "test",
      notes = "test",
      createdAt = "test",
      updatedAt,
    } = data;

    if (!clientName || !jobName || !equipmentName || !price || !invoiceDate) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required invoice data"
      );
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    // Collect PDF data
    doc.on("data", buffers.push.bind(buffers));

    return new Promise((resolve, reject) => {
      doc.on("end", async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);

          // Save to Firebase Storage
          const bucket = admin.storage().bucket();
          const fileName = `invoices/${userId}/${invoiceNumber}.pdf`;
          const file = bucket.file(fileName);

          await file.save(pdfBuffer, {
            metadata: {
              contentType: "application/pdf",
              metadata: {
                userId: userId,
                invoiceNumber: invoiceNumber,
                clientName: clientName,
                createdAt: createdAt,
              },
            },
          });

          // Generate signed URL for download
          const [downloadURL] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
          });

          // Save invoice metadata to Firestore
          const invoiceRecord = {
            ...data,
            invoiceNumber,
            pdfUrl: fileName,
            downloadUrl: downloadURL,
            status: "generated",
          };

          await admin
            .firestore()
            .collection("invoices")
            .doc(invoiceNumber)
            .set(invoiceRecord);

          resolve({
            success: true,
            invoiceNumber,
            downloadUrl: downloadURL,
            message: "Invoice generated successfully",
          });
        } catch (error) {
          reject(
            new functions.https.HttpsError(
              "internal",
              "Failed to save PDF: " + error.message
            )
          );
        }
      });

      // Generate PDF content
      generatePDFContent(doc, {
        invoiceNumber,
        clientName,
        jobName,
        equipmentName,
        description,
        price: parseFloat(price),
        invoiceDate: moment(invoiceDate).format("MMMM DD, YYYY"),
        notes,
        createdAt: moment(createdAt).format("MMMM DD, YYYY"),
      });

      doc.end();
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to generate invoice: " + error.message
    );
  }
});

function generatePDFContent(doc, invoiceData) {
  const {
    invoiceNumber,
    clientName,
    jobName,
    equipmentName,
    description,
    price,
    invoiceDate,
    notes,
    createdAt,
  } = invoiceData;

  // Header
  doc
    .fontSize(20)
    .text("INVOICE", 50, 50, { align: "center" })
    .fontSize(12)
    .text(`Invoice #: ${invoiceNumber}`, 50, 100)
    .text(`Date: ${invoiceDate}`, 50, 120);

  // Company info (customize as needed)
  doc
    .fontSize(16)
    .text("Your Company Name", 350, 50)
    .fontSize(10)
    .text("Your Address Line 1", 350, 80)
    .text("Your Address Line 2", 350, 95)
    .text("Phone: (555) 123-4567", 350, 110)
    .text("Email: your@email.com", 350, 125);

  // Client info
  doc
    .fontSize(14)
    .text("Bill To:", 50, 180)
    .fontSize(12)
    .text(clientName, 50, 200);

  // Job details
  doc
    .fontSize(14)
    .text("Job Details:", 50, 240)
    .fontSize(12)
    .text(`Job Name: ${jobName}`, 50, 260)
    .text(`Equipment: ${equipmentName}`, 50, 280);

  // Invoice table header
  const tableTop = 340;
  doc
    .fontSize(12)
    .text("Description", 50, tableTop)
    .text("Amount", 450, tableTop, { align: "right" });

  // Draw line under header
  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  // Invoice items
  const itemY = tableTop + 30;
  doc
    .text(description || "Service provided", 50, itemY)
    .text(`$${price.toFixed(2)}`, 450, itemY, { align: "right" });

  // Draw line above total
  doc
    .moveTo(50, itemY + 20)
    .lineTo(550, itemY + 20)
    .stroke();

  // Total
  doc
    .fontSize(14)
    .text("Total:", 350, itemY + 40)
    .text(`$${price.toFixed(2)}`, 450, itemY + 40, { align: "right" });

  // Notes section
  if (notes) {
    doc
      .fontSize(12)
      .text("Notes:", 50, itemY + 80)
      .text(notes, 50, itemY + 100, { width: 500 });
  }

  // Footer
  doc
    .fontSize(10)
    .text("Thank you for your business!", 50, 700, { align: "center" })
    .text(`Generated on: ${createdAt}`, 50, 720, { align: "center" });
}

// Alternative HTTP endpoint version for direct download
exports.downloadInvoicePDF = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const invoiceData = req.body;

    // Validate required data
    if (!invoiceData.clientName || !invoiceData.jobName || !invoiceData.price) {
      return res.status(400).json({ error: "Missing required invoice data" });
    }

    const invoiceNumber = `INV-${Date.now()}`;
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${invoiceNumber}.pdf"`
    );

    // Pipe PDF directly to response
    doc.pipe(res);

    // Generate PDF content
    generatePDFContent(doc, {
      invoiceNumber,
      clientName: invoiceData.clientName,
      jobName: invoiceData.jobName,
      equipmentName: invoiceData.equipmentName,
      description: invoiceData.description,
      price: parseFloat(invoiceData.price),
      invoiceDate: moment(invoiceData.invoiceDate).format("MMMM DD, YYYY"),
      notes: invoiceData.notes,
      createdAt: moment().format("MMMM DD, YYYY"),
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// Function to list user's invoices
exports.getUserInvoices = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const userId = context.auth.uid;
    const invoicesRef = admin
      .firestore()
      .collection("invoices")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc");

    const snapshot = await invoicesRef.get();
    const invoices = [];

    snapshot.forEach((doc) => {
      invoices.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { invoices };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to fetch invoices"
    );
  }
});
