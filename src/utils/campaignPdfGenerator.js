import { jsPDF } from 'jspdf';

/**
 * Arabian Sheikh - Luxury Campaign Delivery & Broadcast Intelligence Report Generator
 * Gathers campaign details, recipients, channels (In-App, WhatsApp, Email), and personalized messages into a single PDF.
 */
export function generateCampaignPdf({ batch, recipients = [], messageText = '' }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = margin;
      drawHeaderWatermark();
    }
  };

  const drawHeaderWatermark = () => {
    // Subtle top border line
    doc.setDrawColor(212, 175, 55); // #D4AF37 Gold
    doc.setLineWidth(0.6);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
  };

  // 1. BRAND HEADER (Obsidian & 24K Gold Luxury Styling)
  doc.setFillColor(15, 12, 8); // Deep Obsidian
  doc.rect(margin, y, contentWidth, 24, 'F');
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.rect(margin, y, contentWidth, 24, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(242, 214, 117); // Light Gold #F2D675
  doc.text('ARABIAN SHEIKH — MAISON DE HAUTE PARFUMERIE', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(216, 190, 153); // Sand text
  doc.text('CAMPAIGN BROADCAST & MULTI-CHANNEL DELIVERY INTELLIGENCE REPORT', margin + 6, y + 15);
  doc.text(`Generated: ${new Date().toUTCString()}`, margin + 6, y + 20);

  y += 29;

  // 2. CAMPAIGN METADATA OVERVIEW BOX
  const batchId = batch?.batchId || batch?.id || 'N/A';
  const eventTitle = batch?.title || batch?.eventType || 'Broadcast Campaign';
  const channels = Array.isArray(batch?.channels)
    ? batch.channels.join(', ')
    : (batch?.channel || 'In-App, WhatsApp, Email');
  const totalCount = recipients.length || batch?.totalRecipients || batch?.sent || 0;
  const status = batch?.status || 'Delivered';
  const dateFormatted = batch?.createdAtUtc
    ? new Date(batch.createdAtUtc).toLocaleString('en-GB', { timeZone: 'UTC' }) + ' UTC'
    : new Date().toLocaleString('en-GB');

  doc.setFillColor(248, 245, 238);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(40, 25, 10);
  doc.text('CAMPAIGN SUMMARY & DISPATCH METRICS', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(70, 50, 30);

  // Column 1
  doc.text(`Campaign / Event:`, margin + 4, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${eventTitle}`, margin + 35, y + 13);
  doc.setFont('helvetica', 'normal');

  doc.text(`Batch ID:`, margin + 4, y + 19);
  doc.text(`${batchId}`, margin + 35, y + 19);

  doc.text(`Dispatched At:`, margin + 4, y + 25);
  doc.text(`${dateFormatted}`, margin + 35, y + 25);

  doc.text(`Delivery Status:`, margin + 4, y + 31);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 120, 60);
  doc.text(`${status.toUpperCase()}`, margin + 35, y + 31);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 50, 30);

  // Column 2
  const col2X = margin + 105;
  doc.text(`Active Channels:`, col2X, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${channels}`, col2X + 28, y + 13);
  doc.setFont('helvetica', 'normal');

  doc.text(`Total Targeted:`, col2X, y + 19);
  doc.setFont('helvetica', 'bold');
  doc.text(`${totalCount} Patrons`, col2X + 28, y + 19);
  doc.setFont('helvetica', 'normal');

  doc.text(`Supported Delivery:`, col2X, y + 25);
  doc.text(`In-App, WhatsApp, Email`, col2X + 28, y + 25);

  y += 40;

  // 3. CAMPAIGN BROADCAST MESSAGE CONTENT
  const bodyText = messageText || batch?.body || batch?.message || batch?.text || '';
  if (bodyText) {
    checkPageBreak(30);

    doc.setFillColor(250, 248, 242);
    doc.setDrawColor(180, 150, 100);
    doc.setLineWidth(0.3);

    const splitBody = doc.splitTextToSize(bodyText, contentWidth - 8);
    const boxHeight = Math.max(22, 10 + splitBody.length * 4.5);

    doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(140, 98, 57);
    doc.text('BROADCAST MESSAGE CONTENT (PERSONALIZED TEMPLATE):', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 20, 10);
    doc.text(splitBody, margin + 4, y + 12);

    y += boxHeight + 8;
  }

  // 4. RECIPIENTS DELIVERY ROSTER
  checkPageBreak(25);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(40, 25, 10);
  doc.text(`PATRON DELIVERY ROSTER & STATUS (${recipients.length} RECORDS)`, margin, y);
  y += 4;

  // Table Header
  const colWidths = {
    name: 42,
    contact: 45,
    lang: 16,
    status: 25,
    msg: contentWidth - (42 + 45 + 16 + 25)
  };

  doc.setFillColor(220, 200, 160);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(180, 150, 100);
  doc.rect(margin, y, contentWidth, 7, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 20, 10);

  let currentX = margin + 2;
  doc.text('PATRON NAME', currentX, y + 4.8);
  currentX += colWidths.name;
  doc.text('CONTACT (PHONE/EMAIL)', currentX, y + 4.8);
  currentX += colWidths.contact;
  doc.text('LANG', currentX, y + 4.8);
  currentX += colWidths.lang;
  doc.text('STATUS', currentX, y + 4.8);
  currentX += colWidths.status;
  doc.text('DELIVERED MESSAGE', currentX, y + 4.8);

  y += 7;

  // Table Rows
  if (recipients.length === 0) {
    checkPageBreak(12);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120, 100, 80);
    doc.text('No individual recipient logs returned for this batch. Campaign was dispatched to the segment.', margin + 4, y + 6);
    y += 12;
  } else {
    recipients.forEach((r, idx) => {
      const name = r.recipientName || r.fullName || r.name || r.email || `Patron #${idx + 1}`;
      const contact = r.phone || r.phoneNumber || r.email || '—';
      const lang = (r.language || 'en').toUpperCase();
      const deliveryStatus = r.deliveryStatus || r.status || 'Delivered';
      const rowMsg = r.message || r.body || bodyText || '—';

      const splitMsg = doc.splitTextToSize(rowMsg, colWidths.msg - 4);
      const rowHeight = Math.max(7, splitMsg.length * 3.8 + 3);

      checkPageBreak(rowHeight + 2);

      // Alternate row backgrounds
      if (idx % 2 === 1) {
        doc.setFillColor(248, 246, 240);
        doc.rect(margin, y, contentWidth, rowHeight, 'F');
      }

      doc.setDrawColor(230, 215, 185);
      doc.setLineWidth(0.2);
      doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 20, 10);

      let rowX = margin + 2;
      doc.setFont('helvetica', 'bold');
      doc.text(doc.splitTextToSize(name, colWidths.name - 3), rowX, y + 4.5);
      doc.setFont('helvetica', 'normal');

      rowX += colWidths.name;
      doc.text(doc.splitTextToSize(contact, colWidths.contact - 3), rowX, y + 4.5);

      rowX += colWidths.contact;
      doc.text(lang, rowX, y + 4.5);

      rowX += colWidths.lang;
      if (deliveryStatus === 'Delivered' || deliveryStatus === 'Read') {
        doc.setTextColor(20, 130, 60);
      } else if (deliveryStatus === 'Failed') {
        doc.setTextColor(190, 40, 40);
      } else {
        doc.setTextColor(140, 98, 57);
      }
      doc.setFont('helvetica', 'bold');
      doc.text(deliveryStatus, rowX, y + 4.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 20, 10);

      rowX += colWidths.status;
      doc.text(splitMsg, rowX, y + 4.5);

      y += rowHeight;
    });
  }

  // 5. FOOTER & PAGE NUMBERS
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(130, 110, 90);

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.text(
      'Arabian Sheikh Royal Suite — Confidential Delivery Intelligence — In-App, WhatsApp & Email Dispatches',
      margin,
      pageHeight - 7
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 18,
      pageHeight - 7
    );
  }

  const cleanBatchId = String(batchId).replace(/[^a-zA-Z0-9_-]/g, '');
  doc.save(`ArabianSheikh-Campaign-Report-${cleanBatchId}.pdf`);
  return true;
}
