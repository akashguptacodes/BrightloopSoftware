import PDFDocument from 'pdfkit';

/**
 * Generates a clean, professional PDF invoice buffer
 *
 * @param {Object} invoice - Invoice database record with customer, items, and subscription
 * @returns {Promise<Buffer>}
 */
export function generateInvoicePdfBuffer(invoice) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Primary Brand Colors
      const primaryColor = '#1E40AF'; // Deep Blue
      const secondaryColor = '#4B5563'; // Gray
      const darkColor = '#111827';
      const lightBg = '#F3F4F6';

      // 1. Header (Brand & Title)
      doc
        .fillColor(primaryColor)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('BRIGHTLOOP SOFTWARE', 40, 40)
        .fontSize(9)
        .font('Helvetica')
        .fillColor(secondaryColor)
        .text('Enterprise SaaS Solutions & Cloud Platform', 40, 68)
        .text('support@brightloopsoftware.com | www.brightloopsoftware.com', 40, 80);

      // Invoice Label & Number (Right Aligned)
      doc
        .fillColor(darkColor)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('INVOICE', 350, 40, { align: 'right' })
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .text(invoice.invoiceNumber, 350, 66, { align: 'right' })
        .font('Helvetica')
        .fillColor(secondaryColor)
        .text(`Status: ${invoice.status}`, 350, 80, { align: 'right' });

      // Divider
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(40, 105)
        .lineTo(555, 105)
        .stroke();

      // 2. Invoice Details & Customer Info
      const topInfoY = 120;

      // Bill To Column
      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('BILLED TO:', 40, topInfoY);

      doc
        .fillColor(darkColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(invoice.customer?.contactPerson || 'Customer', 40, topInfoY + 16);

      if (invoice.customer?.companyName) {
        doc
          .fillColor(secondaryColor)
          .fontSize(9)
          .font('Helvetica')
          .text(invoice.customer.companyName, 40, topInfoY + 30);
      }

      doc
        .fillColor(secondaryColor)
        .fontSize(9)
        .font('Helvetica')
        .text(invoice.customer?.email || '', 40, topInfoY + 44)
        .text(invoice.customer?.billingAddress || 'No address provided', 40, topInfoY + 56);

      if (invoice.customer?.taxIdentificationNumber) {
        doc.text(`Tax ID / GSTIN: ${invoice.customer.taxIdentificationNumber}`, 40, topInfoY + 70);
      }

      // Invoice Metadata Column (Right)
      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('INVOICE DETAILS:', 350, topInfoY, { align: 'right' });

      doc
        .fillColor(secondaryColor)
        .fontSize(9)
        .font('Helvetica')
        .text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString('en-IN')}`, 350, topInfoY + 16, { align: 'right' })
        .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}`, 350, topInfoY + 28, { align: 'right' });

      if (invoice.billingPeriodStart && invoice.billingPeriodEnd) {
        doc.text(
          `Period: ${new Date(invoice.billingPeriodStart).toLocaleDateString('en-IN')} - ${new Date(invoice.billingPeriodEnd).toLocaleDateString('en-IN')}`,
          350,
          topInfoY + 40,
          { align: 'right' }
        );
      }

      if (invoice.subscription) {
        doc.text(`Subscription: ${invoice.subscription.subscriptionNumber}`, 350, topInfoY + 54, { align: 'right' });
      }

      // 3. Line Items Table
      const tableTopY = 215;

      // Table Header Bar
      doc
        .rect(40, tableTopY, 515, 22)
        .fill(lightBg);

      doc
        .fillColor(darkColor)
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('ITEM & DESCRIPTION', 50, tableTopY + 6)
        .text('QTY', 280, tableTopY + 6, { align: 'center', width: 40 })
        .text('PRICE', 330, tableTopY + 6, { align: 'right', width: 60 })
        .text('TAX', 400, tableTopY + 6, { align: 'right', width: 50 })
        .text('TOTAL', 460, tableTopY + 6, { align: 'right', width: 85 });

      let currentY = tableTopY + 26;
      doc.font('Helvetica').fontSize(8.5);

      (invoice.items || []).forEach((item, index) => {
        // Alternating row background
        if (index % 2 === 1) {
          doc.rect(40, currentY - 2, 515, 24).fill('#FAFAFA');
        }

        // Title line
        doc
          .fillColor(darkColor)
          .font('Helvetica-Bold')
          .text(item.productNameSnapshot, 50, currentY, { width: 220 });

        // Optional variant/plan tag
        let subline = [];
        if (item.variantNameSnapshot) subline.push(`Variant: ${item.variantNameSnapshot}`);
        if (item.planNameSnapshot) subline.push(`Plan: ${item.planNameSnapshot}`);
        if (item.description) subline.push(item.description);

        if (subline.length > 0) {
          doc
            .font('Helvetica')
            .fontSize(7.5)
            .fillColor(secondaryColor)
            .text(subline.join(' | '), 50, currentY + 11, { width: 220 });
        }

        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor(darkColor)
          .text(String(item.quantity), 280, currentY, { align: 'center', width: 40 })
          .text(`INR ${Number(item.unitPrice).toFixed(2)}`, 330, currentY, { align: 'right', width: 60 })
          .text(`${Number(item.taxRateSnapshot)}%`, 400, currentY, { align: 'right', width: 50 })
          .font('Helvetica-Bold')
          .text(`INR ${Number(item.lineTotal).toFixed(2)}`, 460, currentY, { align: 'right', width: 85 });

        currentY += subline.length > 0 ? 28 : 22;
      });

      // Bottom border of table
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(40, currentY + 4)
        .lineTo(555, currentY + 4)
        .stroke();

      // 4. Totals Summary (Right aligned)
      const summaryStartY = currentY + 14;

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(secondaryColor)
        .text('Subtotal:', 340, summaryStartY, { width: 100, align: 'right' })
        .fillColor(darkColor)
        .text(`INR ${Number(invoice.subtotal).toFixed(2)}`, 450, summaryStartY, { width: 95, align: 'right' });

      doc
        .fillColor(secondaryColor)
        .text('Discounts:', 340, summaryStartY + 16, { width: 100, align: 'right' })
        .text(`- INR ${Number(invoice.discountTotal).toFixed(2)}`, 450, summaryStartY + 16, { width: 95, align: 'right' });

      doc
        .fillColor(secondaryColor)
        .text('Taxes:', 340, summaryStartY + 32, { width: 100, align: 'right' })
        .text(`+ INR ${Number(invoice.taxTotal).toFixed(2)}`, 450, summaryStartY + 32, { width: 95, align: 'right' });

      // Total Box
      doc
        .rect(340, summaryStartY + 48, 215, 26)
        .fill(lightBg);

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(primaryColor)
        .text('Total Amount:', 350, summaryStartY + 55)
        .text(`INR ${Number(invoice.totalAmount).toFixed(2)}`, 450, summaryStartY + 55, { width: 95, align: 'right' });

      // Amount Paid & Balance Due
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(secondaryColor)
        .text('Amount Paid:', 340, summaryStartY + 80, { width: 100, align: 'right' })
        .fillColor(darkColor)
        .text(`INR ${Number(invoice.amountPaid).toFixed(2)}`, 450, summaryStartY + 80, { width: 95, align: 'right' });

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(invoice.amountDue > 0 ? '#DC2626' : '#059669')
        .text('Balance Due:', 340, summaryStartY + 96, { width: 100, align: 'right' })
        .text(`INR ${Number(invoice.amountDue).toFixed(2)}`, 450, summaryStartY + 96, { width: 95, align: 'right' });

      // 5. Notes & Terms (Left column under table)
      if (invoice.notes || invoice.termsAndConditions) {
        doc
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .fillColor(darkColor)
          .text('NOTES & CONDITIONS:', 40, summaryStartY);

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(secondaryColor)
          .text(invoice.notes || '', 40, summaryStartY + 14, { width: 280 });

        if (invoice.termsAndConditions) {
          doc.text(invoice.termsAndConditions, 40, summaryStartY + 32, { width: 280 });
        }
      }

      // 6. Footer
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(0.5)
        .moveTo(40, 780)
        .lineTo(555, 780)
        .stroke();

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(secondaryColor)
        .text(
          'Thank you for your business! Brightloop Software — Automated Subscription Billing Engine.',
          40,
          788,
          { align: 'center', width: 515 }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

