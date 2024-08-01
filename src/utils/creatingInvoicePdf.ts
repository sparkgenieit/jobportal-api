import * as fs from "fs";
import { join } from "path";
import * as HandleBars from 'handlebars';
import * as puppeteer from 'puppeteer';

export async function invoicePdfCreation(details: any) {
    try {
        const templatePath = join(__dirname, "..", "..", "pdf", "invoice_pdf.hbs")
        const templateContent = await fs.promises.readFile(templatePath, 'utf8');
        const template = HandleBars.compile(templateContent)
        const html = template(details)
        const tempHTMLFile = join(__dirname, "..", "..", "pdf", `${details.invoiceNumber}.html`);
        await fs.promises.writeFile(tempHTMLFile, html)

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`file://${tempHTMLFile}`);

        const outputPDFPath = join(__dirname, "..", "..", "public", "invoices", `${details.invoiceNumber}.pdf`)
        const pdfBuffer = await page.pdf({ path: outputPDFPath, format: 'A4' });

        await browser.close();
        await fs.promises.unlink(tempHTMLFile);

        return pdfBuffer;

    }
    catch (error) {
        console.error('Error generating PDF:', error);
    }
}

