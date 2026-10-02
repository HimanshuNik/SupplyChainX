import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

export const generateInvoicePDF = (invoice) => {
  const doc = new jsPDF();

  // Header / Branding
  doc.setFillColor(37, 99, 235); // #2563EB Primary Blue
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SupplyChainX', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Enterprise Logistics & Supply Chain Solutions', 14, 24);

  doc.setFontSize(16);
  doc.text('TAX INVOICE', 196, 18, { align: 'right' });

  // Invoice Details
  doc.setTextColor(15, 23, 42); // Text #0F172A
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice No: ${invoice.invoiceNumber || 'INV-0000'}`, 14, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order Ref: ${invoice.salesOrderNumber || 'N/A'}`, 14, 46);
  doc.text(`Invoice Date: ${formatDate(invoice.issueDate)}`, 14, 52);
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 14, 58);

  // Status Badge
  const status = invoice.status || 'Pending';
  doc.setFillColor(status === 'Paid' ? 22 : 245, status === 'Paid' ? 163 : 158, status === 'Paid' ? 74 : 11);
  doc.roundedRect(160, 36, 36, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(status.toUpperCase(), 178, 41.5, { align: 'center' });

  // Bill To / Customer Details
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To:', 14, 70);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.customerName || 'Valued Customer', 14, 76);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerAddress || 'Maharashtra, India', 14, 82);
  if (invoice.customerEmail) doc.text(`Email: ${invoice.customerEmail}`, 14, 88);

  // Table of Items
  const tableRows = (invoice.items || []).map((item, index) => [
    index + 1,
    item.productName || item.sku || 'Item',
    item.sku || 'SKU',
    item.quantity || 1,
    `Rs. ${(item.unitPrice || 0).toLocaleString('en-IN')}`,
    `Rs. ${(item.totalPrice || 0).toLocaleString('en-IN')}`
  ]);

  autoTable(doc, {
    startY: 96,
    head: [['#', 'Item Description', 'SKU', 'Qty', 'Unit Price', 'Amount']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  // Financial Breakdown Summary
  const startX = 120;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  doc.text('Subtotal:', startX, finalY);
  doc.text(`Rs. ${(invoice.subtotal || 0).toLocaleString('en-IN')}`, 196, finalY, { align: 'right' });

  doc.text('GST / Tax (18%):', startX, finalY + 6);
  doc.text(`Rs. ${(invoice.tax || 0).toLocaleString('en-IN')}`, 196, finalY + 6, { align: 'right' });

  if (invoice.discount > 0) {
    doc.text('Discount:', startX, finalY + 12);
    doc.text(`- Rs. ${(invoice.discount || 0).toLocaleString('en-IN')}`, 196, finalY + 12, { align: 'right' });
  }

  // Total
  const totalY = invoice.discount > 0 ? finalY + 20 : finalY + 14;
  doc.setFillColor(241, 245, 249);
  doc.rect(startX - 2, totalY - 4, 78, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total Amount:', startX, totalY + 2);
  doc.text(`Rs. ${(invoice.totalAmount || 0).toLocaleString('en-IN')}`, 196, totalY + 2, { align: 'right' });

  // Paid & Balance
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Amount Paid:', startX, totalY + 10);
  doc.text(`Rs. ${(invoice.paidAmount || 0).toLocaleString('en-IN')}`, 196, totalY + 10, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(invoice.balanceAmount > 0 ? 220 : 22, invoice.balanceAmount > 0 ? 38 : 163, invoice.balanceAmount > 0 ? 38 : 74);
  doc.text('Balance Due:', startX, totalY + 16);
  doc.text(`Rs. ${(invoice.balanceAmount || 0).toLocaleString('en-IN')}`, 196, totalY + 16, { align: 'right' });

  // Footer notes
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Payment Terms: Net 15 days. For electronic transfers, please reference this invoice number.', 14, 280);
  doc.text('Generated via SupplyChainX Enterprise Multi-Warehouse Platform', 14, 284);

  doc.save(`${invoice.invoiceNumber || 'Invoice'}.pdf`);
};

export const exportReportToPDF = (title, columns, data, filename = 'Report') => {
  const doc = new jsPDF('landscape');

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 297, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SupplyChainX Enterprise Report', 14, 15);

  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, 283, 15, { align: 'right' });

  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.text(title, 14, 32);

  // Table
  const headers = columns.map(c => c.header || c.title || c.key);
  const rows = data.map(item => columns.map(c => item[c.key] !== undefined ? String(item[c.key]) : ''));

  autoTable(doc, {
    startY: 38,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 }
  });

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const exportReportToCSV = (columns, data, filename = 'Report') => {
  const headers = columns.map(c => `"${c.header || c.title || c.key}"`).join(',');
  const rows = data.map(item => {
    return columns.map(c => {
      let val = item[c.key] !== undefined ? item[c.key] : '';
      if (typeof val === 'string') {
        val = val.replace(/"/g, '""');
      }
      return `"${val}"`;
    }).join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
