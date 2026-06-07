import PDFDocument from 'pdfkit';
import { Response } from 'express';
import Invoice from '../models/Invoice';
import Settings from '../models/Settings';
import { generateInvoiceNumber } from '../utils/helpers';
import { IOrder } from '../models/Order';

export const generateInvoiceFromOrder = async (order: IOrder, userId: string) => {
  const settings = await Settings.findOne();
  const invoiceNumber = generateInvoiceNumber();

  const invoice = await Invoice.create({
    invoiceNumber,
    order: order._id,
    user: userId,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      gstRate: item.gstRate,
      cgst: item.gstAmount / 2,
      sgst: item.gstAmount / 2,
      total: item.total,
    })),
    subtotal: order.subtotal,
    cgst: order.cgst,
    sgst: order.sgst,
    totalGst: order.totalGst,
    discount: order.discount,
    shippingCharges: order.shippingCharges,
    grandTotal: order.total,
    shopDetails: {
      name: settings?.shopName || 'MobiStore',
      address: settings?.shopAddress || '',
      gstin: settings?.gstin,
      phone: settings?.shopPhone || '',
      email: settings?.shopEmail || '',
    },
    customerDetails: {
      name: order.shippingAddress.fullName,
      address: `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
      phone: order.shippingAddress.phone,
      email: '',
    },
    paymentMethod: order.paymentMethod,
  });

  order.invoiceNumber = invoiceNumber;
  await order.save();

  return invoice;
};

export const streamInvoicePDF = (invoice: InstanceType<typeof Invoice>, res: Response) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).text('TAX INVOICE', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(invoice.shopDetails.name, { align: 'left' });
  doc.text(invoice.shopDetails.address);
  if (invoice.shopDetails.gstin) doc.text(`GSTIN: ${invoice.shopDetails.gstin}`);
  doc.text(`Phone: ${invoice.shopDetails.phone}`);
  doc.moveDown();

  doc.text(`Invoice No: ${invoice.invoiceNumber}`);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`);
  doc.moveDown();

  doc.text('Bill To:', { underline: true });
  doc.text(invoice.customerDetails.name);
  doc.text(invoice.customerDetails.address);
  doc.text(`Phone: ${invoice.customerDetails.phone}`);
  doc.moveDown();

  doc.text('Items:', { underline: true });
  invoice.items.forEach((item) => {
    doc.text(`${item.name} x ${item.quantity} - ₹${item.total.toLocaleString('en-IN')}`);
  });
  doc.moveDown();

  doc.text(`Subtotal: ₹${invoice.subtotal.toLocaleString('en-IN')}`);
  doc.text(`CGST: ₹${invoice.cgst.toLocaleString('en-IN')}`);
  doc.text(`SGST: ₹${invoice.sgst.toLocaleString('en-IN')}`);
  if (invoice.discount > 0) doc.text(`Discount: -₹${invoice.discount.toLocaleString('en-IN')}`);
  doc.text(`Shipping: ₹${invoice.shippingCharges.toLocaleString('en-IN')}`);
  doc.fontSize(14).text(`Grand Total: ₹${invoice.grandTotal.toLocaleString('en-IN')}`, { underline: true });

  doc.end();
};
