import { Bill, SplitResult } from "@/domain/entities/Bill";
import { formatMoney, roundValue } from "@/presentation/utils/currencyUtils";

export class ShareService {
  static formatPersonSummary(result: SplitResult, currencyCode: string = 'IDR'): string {
    let text = result.shopName ? `*${result.shopName}*\n` : '';
    text += `*Bill Summary for ${result.personName}*\n`;
    text += `--------------------------\n`;

    const groupedItems = result.items.reduce((acc, item) => {
      const existing = acc.find(i => i.name === item.name);
      if (existing) {
        existing.splitPrice += item.splitPrice;
        existing.quantity += 1;
      } else {
        acc.push({ name: item.name, splitPrice: item.splitPrice, quantity: 1 });
      }
      return acc;
    }, [] as { name: string; splitPrice: number; quantity: number }[]);

    groupedItems.forEach(item => {
      const qtyStr = item.quantity > 1 ? ` (x${item.quantity})` : '';
      text += `• ${item.name}${qtyStr}: ${formatMoney(item.splitPrice, currencyCode)}\n`;
    });

    text += `--------------------------\n`;
    text += `Subtotal: ${formatMoney(result.subtotal, currencyCode)}\n`;

    if (result.taxAmount > 0 || result.serviceChargeAmount > 0) {
      text += `Tax & Service: ${formatMoney(result.taxAmount + result.serviceChargeAmount, currencyCode)}\n`;
    }

    if (result.extraChargesAmount > 0) {
      text += `Extra Charges: ${formatMoney(result.extraChargesAmount, currencyCode)}\n`;
    }

    if (result.discountAmount > 0) {
      text += `Discounts: -${formatMoney(result.discountAmount, currencyCode)}\n`;
    }

    text += `--------------------------\n`;
    text += `*Total to Pay: ${formatMoney(result.total, currencyCode)}*\n\n`;
    text += `Shared via Enwari`;

    return text;
  }

  static formatGlobalSummary(bill: Bill, results: SplitResult[]): string {
    const currencyCode = bill.currency || 'IDR';
    const subtotal = bill.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const taxAmount = (subtotal * bill.tax) / 100;
    const serviceChargeAmount = (subtotal * bill.serviceCharge) / 100;
    const extraChargesAmount = bill.extraCharges.reduce((acc, charge) => {
      if (charge.type === 'percentage') return acc + (subtotal * charge.value) / 100;
      return acc + charge.value;
    }, 0);
    const totalDiscount = results.reduce((acc, res) => acc + res.discountAmount, 0);
    const grandTotal = roundValue(subtotal + taxAmount + serviceChargeAmount + extraChargesAmount - totalDiscount, bill.roundingMode);

    let text = bill.shopName ? `*${bill.shopName}*\n` : '';
    text += `*Enwari Summary*\n`;
    text += `Grand Total: ${formatMoney(grandTotal, currencyCode)}\n`;
    if (totalDiscount > 0) text += `Total Discounts: -${formatMoney(totalDiscount, currencyCode)}\n`;
    text += `--------------------------\n\n`;

    results.forEach(res => {
      text += `*${res.personName}*: ${formatMoney(res.total, currencyCode)}\n`;
    });

    text += `\n--------------------------\n`;
    text += `Shared via Enwari`;

    return text;
  }

  static async share(title: string, text: string) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback if user cancels or error occurs
        this.fallbackToWhatsApp(text);
      }
    } else {
      this.fallbackToWhatsApp(text);
    }
  }

  private static fallbackToWhatsApp(text: string) {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
}
