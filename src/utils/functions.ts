import * as fs from "fs";
import { join } from "path";
import * as PDFDocumet from 'pdfkit';
import { randomBytes } from "crypto";

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


export function generateRandomUniqueNumber() {
    const timestamp = Date.now();
    const random = randomBytes(4) // Generate 4 random bytes
    const randomNum = parseInt(random.toString("hex"), 16)
    const combinedNumber = (timestamp * 10000) + randomNum;
    const formattedNumber = combinedNumber.toString().slice(-8)
    return formattedNumber;
}
