const PDFDocument = require('pdfkit');

/**
 * Generates an Invoice PDF buffer
 * @param {Object} invoice - Invoice data including lines, customer, and amounts
 * @returns {Promise<Buffer>}
 */
function generateInvoicePDF(invoice) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Header
            doc.fontSize(20).text('Brightloop Software', { align: 'left' });
            doc.fontSize(10).text('Subscription & Billing Department', { align: 'left' });
            doc.moveDown();

            doc.fontSize(16).text(`INVOICE: ${invoice.invoice_number || 'INV-DRAFT'}`, { align: 'right' });
            doc.fontSize(10).text(`Date: ${invoice.issue_date || new Date().toISOString().split('T')[0]}`, { align: 'right' });
            doc.text(`Due Date: ${invoice.due_date || 'N/A'}`, { align: 'right' });
            doc.text(`Status: ${(invoice.status || 'DRAFT').toUpperCase()}`, { align: 'right' });
            doc.moveDown();

            // Customer Info
            doc.fontSize(12).text('Billed To:');
            doc.fontSize(10).text(`Customer: ${invoice.customer_name || 'Valued Customer'}`);
            doc.text(`Email: ${invoice.customer_email || 'N/A'}`);
            doc.moveDown();

            // Table Header
            const tableTop = doc.y;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Description', 50, tableTop);
            doc.text('Qty', 280, tableTop, { width: 50, align: 'right' });
            doc.text('Unit Price', 340, tableTop, { width: 70, align: 'right' });
            doc.text('Tax', 420, tableTop, { width: 50, align: 'right' });
            doc.text('Total', 480, tableTop, { width: 70, align: 'right' });
            doc.moveDown();

            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.font('Helvetica');

            // Table Rows
            const lines = invoice.lines || [];
            lines.forEach(line => {
                const y = doc.y + 8;
                doc.text(line.description || 'Service', 50, y, { width: 220 });
                doc.text(String(line.quantity || 1), 280, y, { width: 50, align: 'right' });
                doc.text(`$${Number(line.unit_price || 0).toFixed(2)}`, 340, y, { width: 70, align: 'right' });
                doc.text(`${Number(line.tax_rate || 0)}%`, 420, y, { width: 50, align: 'right' });
                doc.text(`$${Number(line.line_total || 0).toFixed(2)}`, 480, y, { width: 70, align: 'right' });
                doc.moveDown();
            });

            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
            doc.moveDown(2);

            // Summary Totals
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text(`Subtotal: $${Number(invoice.subtotal || 0).toFixed(2)}`, { align: 'right' });
            doc.text(`Discount: -$${Number(invoice.discount_total || 0).toFixed(2)}`, { align: 'right' });
            doc.text(`Taxes: $${Number(invoice.tax_total || 0).toFixed(2)}`, { align: 'right' });
            doc.fontSize(12).text(`Total Due: $${Number(invoice.total_amount || 0).toFixed(2)}`, { align: 'right' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generateInvoicePDF,
};

