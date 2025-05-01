import * as fs from "fs";
import { join } from "path";
import * as PDFDocumet from 'pdfkit';
import * as fspromises from 'fs/promises';
import * as pdfParser from 'pdf-parse';
import { isProfane } from 'no-profanity';
import mongoose from "mongoose";

export function invoicePdfCreation(details: any) {
    try {
        const doc = new PDFDocumet({ size: "A4" });
        doc.pipe(fs.createWriteStream(join(__dirname, "..", "..", "public", "invoices", `${details.invoiceNumber}.pdf`)));

        doc.font('Helvetica-Bold').fontSize(12).text("INFOSOL NZ LIMITED", 50, 40);

        doc.font("Helvetica").text(`
            PO BOX 27400 
            MT ROSKILL
            AUCKLAND - 1440
            NEW ZEALAND`
            , 10)


        doc.font('Helvetica-Bold').fontSize(25).text("Invoice", 1, 50, { align: "right" });

        doc.font("Helvetica").fontSize(12).text(`
            To
            ${details.CompanyName}
            ${details.CompanyEmail}
            ${details.Address1}
            ${details.Address2}
            ${details.Address3}
            `
            , 10, 150)

        doc.font("Helvetica").fontSize(12).text(`
            GST No: 126-691-726
            Invoice No: ${details.invoiceNumber}
            Date: ${details.date}`
            , 10, 150, { align: "right" })

        // Draw table border
        const tableWidth = 500;
        const tableHeight = 250;
        doc.rect(50, 270, tableWidth, tableHeight).stroke();

        doc.font('Helvetica-Bold').text('DESCRIPTION', 60, 280)
        doc.font('Helvetica-Bold').text('AMOUNT', 60, 280, { align: "right" })

        // Horizontal Line
        doc.moveTo(50, 300) // Start point
            .lineTo(550, 300) // End point
            .stroke()

        //Vertical Line
        doc.moveTo(450, 270)
            .lineTo(450, 520)
            .stroke();

        doc.font('Helvetica').text('Advertising fee on Working Holiday Jobs portal ', 60, 330)
        doc.text("$" + details.price, 1, 330, { align: "right" })

        doc.font('Helvetica').text('GST @ 15%  ', 60, 420)
        doc.text("$" + details.gstPrice, 1, 420, { align: "right" })

        // Total Horizonatal line 
        doc.moveTo(50, 480) // Start point
            .lineTo(550, 480) // End point
            .stroke()

        doc.font('Helvetica-Bold').text('Total  ', 60, 500)
        doc.text("$" + details.totalPrice, 1, 500, { align: "right" })

        doc.font('Helvetica-BoldOblique').text('Thank you for your business', 60, 550, { align: "center" });
        doc.font('Helvetica').text('For any queries in regards to this invoice, please contact whbiling@infosol.co.nz', 60, 600);

        doc.end();
    }
    catch (error) {
        console.error('Error generating PDF:', error);
    }
}

export const ENV = {
    JWT_SECRET_KEY: "WHTOKENSECRETKEY",
    CAPTCHA_SECRET_KEY: "6LdnnokqAAAAAIBKyXfoOmyDcHiqSCmBQ-L1jxcu",
    STRIPE_SERVER_KEY: 'sk_test_51PKHdMSIkLQ1QpWMKj1xClSWqcOgyIQsd28qfTkD7scrtjZ5Nf2dAijNlyHXlq5a5CCHzEzqwuqJnV9XydBGYz4z00rBFUPxZc',
    ALLOWED_ORIGIN: 'http://localhost:3000',
   // DATABASE_URL: "mongodb://127.0.0.1:27017/jobportal?authSource=admin"
   DATABASE_URL: "mongodb+srv://sparkgenieit:<QAcfZsJ0TceXCPiC>@cluster0.ir27msy.mongodb.net/jobportal" 
}

export const convertToObjectId = (id: string) => new mongoose.Types.ObjectId(id);

export const isBad = async (filePath: string) => {

    const fileBuffer = await fspromises.readFile(filePath);

    const pdfData = await pdfParser(fileBuffer);

    const isValid = isProfane(pdfData.text);

    return isValid;
}
