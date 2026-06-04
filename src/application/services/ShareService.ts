import { Bill, SplitResult } from "@/domain/entities/Bill";

export class ShareService {
  static formatPersonSummary(result: SplitResult): string {
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
      text += `• ${item.name}${qtyStr}: Rp ${item.splitPrice.toLocaleString()}\n`;
    });

    text += `--------------------------\n`;
    text += `Subtotal: Rp ${result.subtotal.toLocaleString()}\n`;

    if (result.taxAmount > 0 || result.serviceChargeAmount > 0) {
      text += `Tax & Service: Rp ${(result.taxAmount + result.serviceChargeAmount).toLocaleString()}\n`;
    }

    if (result.extraChargesAmount > 0) {
      text += `Extra Charges: Rp ${result.extraChargesAmount.toLocaleString()}\n`;
    }

    if (result.discountAmount > 0) {
      text += `Discounts: -Rp ${Math.floor(result.discountAmount).toLocaleString()}\n`;
    }

    text += `--------------------------\n`;
    text += `*Total to Pay: Rp ${result.total.toLocaleString()}*\n\n`;
    text += `Shared via Enwari`;

    return text;
  }

  static formatGlobalSummary(bill: Bill, results: SplitResult[]): string {
    const subtotal = bill.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const taxAmount = (subtotal * bill.tax) / 100;
    const serviceChargeAmount = (subtotal * bill.serviceCharge) / 100;
    const extraChargesAmount = bill.extraCharges.reduce((acc, charge) => {
      if (charge.type === 'percentage') return acc + (subtotal * charge.value) / 100;
      return acc + charge.value;
    }, 0);
    const totalDiscount = results.reduce((acc, res) => acc + res.discountAmount, 0);
    const grandTotal = subtotal + taxAmount + serviceChargeAmount + extraChargesAmount - totalDiscount;

    let text = bill.shopName ? `*${bill.shopName}*\n` : '';
    text += `*Enwari Summary*\n`;
    text += `Grand Total: Rp ${grandTotal.toLocaleString()}\n`;
    if (totalDiscount > 0) text += `Total Discounts: -Rp ${totalDiscount.toLocaleString()}\n`;
    text += `--------------------------\n\n`;

    results.forEach(res => {
      text += `*${res.personName}*: Rp ${res.total.toLocaleString()}\n`;
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
