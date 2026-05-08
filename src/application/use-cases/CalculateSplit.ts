import { Bill, SplitResult } from "@/domain/entities/Bill";

export const calculateSplit = (bill: Bill): SplitResult[] => {
  const results: Record<string, SplitResult> = {};

  // Initialize results for each person
  bill.people.forEach((person) => {
    results[person.id] = {
      personId: person.id,
      personName: person.name,
      shopName: bill.shopName,
      items: [],
      subtotal: 0,
      taxAmount: 0,
      serviceChargeAmount: 0,
      extraChargesAmount: 0,
      discountAmount: 0,
      total: 0,
    };
  });

  // Calculate item splits
  bill.items.forEach((item) => {
    const totalItemPrice = item.price * item.quantity;
    const splitCount = item.assignedTo.length;

    if (splitCount > 0) {
      const pricePerPerson = totalItemPrice / splitCount;
      item.assignedTo.forEach((personId) => {
        if (results[personId]) {
          results[personId].items.push({
            name: item.name,
            originalPrice: totalItemPrice,
            splitPrice: pricePerPerson,
          });
          results[personId].subtotal += pricePerPerson;
        }
      });
    }
  });

  const totalSubtotal = Object.values(results).reduce((acc, curr) => acc + curr.subtotal, 0);

  // Calculate total discounts
  let totalDiscountAmount = 0;
  bill.discounts.forEach(discount => {
    if (!discount.minPurchase || totalSubtotal >= discount.minPurchase) {
      let amount = 0;
      if (discount.type === 'fixed') {
        amount = discount.value;
      } else {
        amount = (totalSubtotal * discount.value) / 100;
        if (discount.maxDiscount) {
          amount = Math.min(amount, discount.maxDiscount);
        }
      }
      totalDiscountAmount += amount;
    }
  });

  // Apply tax, service charge, extra charges, and discounts proportionally
  Object.values(results).forEach((res) => {
    const ratio = totalSubtotal > 0 ? res.subtotal / totalSubtotal : 0;

    res.discountAmount = totalDiscountAmount * ratio;
    res.taxAmount = Math.round((res.subtotal * bill.tax) / 100);
    res.serviceChargeAmount = Math.round((res.subtotal * bill.serviceCharge) / 100);
    
    res.extraChargesAmount = bill.extraCharges.reduce((acc, charge) => {
      if (charge.type === 'percentage') {
        return acc + Math.round((res.subtotal * charge.value) / 100);
      } else {
        return acc + Math.round(charge.value * ratio);
      }
    }, 0);

    res.total = Math.ceil(res.subtotal - res.discountAmount + res.taxAmount + res.serviceChargeAmount + res.extraChargesAmount);
  });

  return Object.values(results);
};
