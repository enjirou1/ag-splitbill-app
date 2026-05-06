import { Bill, SplitResult } from "@/domain/entities/Bill";

export const calculateSplit = (bill: Bill): SplitResult[] => {
  const results: Record<string, SplitResult> = {};

  // Initialize results for each person
  bill.people.forEach((person) => {
    results[person.id] = {
      personId: person.id,
      personName: person.name,
      items: [],
      subtotal: 0,
      taxAmount: 0,
      serviceChargeAmount: 0,
      extraChargesAmount: 0,
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

  // Apply tax, service charge, and extra charges proportionally
  Object.values(results).forEach((res) => {
    const ratio = totalSubtotal > 0 ? res.subtotal / totalSubtotal : 0;

    res.taxAmount = (res.subtotal * bill.tax) / 100;
    res.serviceChargeAmount = (res.subtotal * bill.serviceCharge) / 100;
    
    res.extraChargesAmount = bill.extraCharges.reduce((acc, charge) => {
      if (charge.type === 'percentage') {
        return acc + (res.subtotal * charge.value) / 100;
      } else {
        return acc + charge.value * ratio;
      }
    }, 0);

    res.total = Math.ceil(res.subtotal + res.taxAmount + res.serviceChargeAmount + res.extraChargesAmount);
  });

  return Object.values(results);
};
