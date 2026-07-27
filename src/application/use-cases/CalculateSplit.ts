import { Bill, SplitResult } from "@/domain/entities/Bill";
import { roundValue } from "@/presentation/utils/currencyUtils";

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

  // Apply tax, service charge, extra charges, and discounts
  Object.values(results).forEach((res) => {
    const ratio = totalSubtotal > 0 ? res.subtotal / totalSubtotal : 0;

    // Calculate discount for this person
    let personDiscount = 0;
    bill.discounts.forEach((discount) => {
      if (!discount.minPurchase || totalSubtotal >= discount.minPurchase) {
        if (discount.type === 'percentage') {
          let discountVal = (totalSubtotal * discount.value) / 100;
          if (discount.maxDiscount) {
            discountVal = Math.min(discountVal, discount.maxDiscount);
          }
          personDiscount += discountVal * ratio;
        } else {
          // Fixed discount
          if (discount.splitMode === 'equal') {
            const peopleCount = bill.people.length;
            personDiscount += peopleCount > 0 ? discount.value / peopleCount : 0;
          } else {
            // default is proportional
            personDiscount += discount.value * ratio;
          }
        }
      }
    });
    res.discountAmount = personDiscount;

    res.taxAmount = (res.subtotal * bill.tax) / 100;
    res.serviceChargeAmount = (res.subtotal * bill.serviceCharge) / 100;
    
    res.extraChargesAmount = bill.extraCharges.reduce((acc, charge) => {
      if (charge.type === 'percentage') {
        return acc + (res.subtotal * charge.value) / 100;
      } else {
        if (charge.splitMode === 'equal') {
          const peopleCount = bill.people.length;
          return acc + (peopleCount > 0 ? charge.value / peopleCount : 0);
        } else {
          return acc + charge.value * ratio;
        }
      }
    }, 0);

    res.total = roundValue(res.subtotal - res.discountAmount + res.taxAmount + res.serviceChargeAmount + res.extraChargesAmount, bill.roundingMode);
  });

  return Object.values(results);
};
