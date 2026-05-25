import jsPDF from 'jspdf';
import { Bill, SplitResult } from '@/domain/entities/Bill';

export const exportToPDF = (bill: Bill, results: SplitResult[], filename: string = 'receipt.pdf') => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 297], // Thermal printer width (80mm)
  });

  const margin = 5;
  const width = 80;
  let y = 10;

  // Helper to draw horizontal line
  const line = (char: string = '-') => {
    const str = char.repeat(40);
    pdf.setFont('courier', 'normal');
    pdf.text(str, margin, y);
    y += 5;
  };

  // Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(bill.shopName ? 16 : 14);
  pdf.text(bill.shopName ? bill.shopName.toUpperCase() : 'ENWARI', width / 2, y, { align: 'center' });
  y += 6;
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date().toLocaleString(), width / 2, y, { align: 'center' });
  y += 5;

  line('=');

  // Items
  pdf.setFont('helvetica', 'bold');
  pdf.text('ITEMS', margin, y);
  y += 5;

  pdf.setFont('courier', 'normal');
  pdf.setFontSize(7);
  bill.items.forEach((item) => {
    const nameLines = pdf.splitTextToSize(item.name, 45);
    const priceInfo = `${item.quantity}x ${item.price.toLocaleString()}`;
    const total = (item.price * item.quantity).toLocaleString();
    
    pdf.text(nameLines, margin, y);
    pdf.text(total, width - margin, y, { align: 'right' });
    y += (nameLines.length * 4);
    pdf.text(priceInfo, margin + 2, y);
    y += 5;

    // Check for page overflow
    if (y > 280) {
      pdf.addPage();
      y = 10;
    }
  });

  line('-');

  // Calculations
  const subtotal = bill.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxAmount = (subtotal * bill.tax) / 100;
  const serviceChargeAmount = (subtotal * bill.serviceCharge) / 100;
  const extraChargesAmount = bill.extraCharges.reduce((acc, charge) => {
    if (charge.type === 'percentage') return acc + (subtotal * charge.value) / 100;
    return acc + charge.value;
  }, 0);

  const totalDiscount = results.reduce((acc, res) => acc + res.discountAmount, 0);
  const grandTotal = subtotal + taxAmount + serviceChargeAmount + extraChargesAmount - totalDiscount;

  const drawRow = (label: string, value: string, isBold: boolean = false) => {
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    const labelLines = pdf.splitTextToSize(label, 45);
    pdf.text(labelLines, margin, y);
    pdf.text(value, width - margin, y, { align: 'right' });
    y += Math.max(labelLines.length * 4, 5);
  };

  drawRow('Subtotal:', subtotal.toLocaleString());
  if (taxAmount > 0) drawRow(`Tax (${bill.tax}%):`, taxAmount.toLocaleString());
  if (serviceChargeAmount > 0) drawRow(`Service (${bill.serviceCharge}%):`, serviceChargeAmount.toLocaleString());
  
  bill.extraCharges.forEach(charge => {
    const label = charge.name + (charge.type === 'percentage' ? ` (${charge.value}%):` : ':');
    const val = (charge.type === 'percentage' ? (subtotal * charge.value) / 100 : charge.value).toLocaleString();
    drawRow(label, val);
  });

  bill.discounts.forEach(discount => {
    if (!discount.minPurchase || subtotal >= discount.minPurchase) {
      let amount = 0;
      if (discount.type === 'fixed') {
        amount = discount.value;
      } else {
        amount = (subtotal * discount.value) / 100;
        if (discount.maxDiscount) amount = Math.min(amount, discount.maxDiscount);
      }
      drawRow(`Discount (${discount.name}):`, `- ${amount.toLocaleString()}`);
    }
  });

  line('=');
  pdf.setFontSize(10);
  drawRow('GRAND TOTAL:', `Rp ${grandTotal.toLocaleString()}`, true);
  pdf.setFontSize(7);
  y += 2;

  line('=');

  // Split Results
  pdf.setFont('helvetica', 'bold');
  pdf.text('SPLIT BREAKDOWN', margin, y);
  y += 6;

  results.forEach((res) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(res.personName.toUpperCase(), margin, y);
    pdf.text(`Rp ${res.total.toLocaleString()}`, width - margin, y, { align: 'right' });
    y += 4;

    pdf.setFont('helvetica', 'italic');
    res.items.forEach(item => {
      const nameLines = pdf.splitTextToSize(`- ${item.name}`, 45);
      pdf.text(nameLines, margin + 2, y);
      pdf.text(item.splitPrice.toLocaleString(), width - margin - 2, y, { align: 'right' });
      y += (nameLines.length * 4);
    });

    const otherCharges = res.taxAmount + res.serviceChargeAmount + res.extraChargesAmount;
    if (otherCharges > 0) {
      pdf.text(`- Taxes & Extra`, margin + 2, y);
      pdf.text(otherCharges.toLocaleString(), width - margin - 2, y, { align: 'right' });
      y += 4;
    }

    if (res.discountAmount > 0) {
      pdf.text(`- Discounts`, margin + 2, y);
      pdf.text(`- ${Math.floor(res.discountAmount).toLocaleString()}`, width - margin - 2, y, { align: 'right' });
      y += 4;
    }
    
    y += 3;
    line('.');

    if (y > 280) {
      pdf.addPage();
      y = 10;
    }
  });

  y += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.text('Thank you for using Enwari!', width / 2, y, { align: 'center' });
  
  pdf.save(filename);
};
