const SHOPLAB_VERSION = "shoplab-3.8-catalog-sort";
const MIN_BUDGET = 2000;
const MAX_BUDGET = 30000;
function validBudget(budget) {
    return Number.isInteger(budget) && budget >= MIN_BUDGET && budget <= MAX_BUDGET;
}
function calculatePricing(budget) {
    if (!validBudget(budget)) throw new Error("Недопустимый бюджет");
    const multiplier = budget / 7000;
    const serviceFee = Math.round(budget / 1000) * 100;
    const products = {};
    for (const product of SHOPLAB_PRODUCTS) {
        let basePrice = Math.round((product.basePrice * multiplier + 10) / 100) * 100 - 10;
        // Preserve the original affordability categories despite rounding.
        if (["A", "B", "D"].includes(product.id)) basePrice = Math.min(basePrice, Math.floor((budget - serviceFee + 10) / 100) * 100 - 10);
        else basePrice = Math.max(basePrice, (Math.floor((budget - serviceFee + 10) / 100) + 1) * 100 - 10);
        if (product.id === "C") basePrice = Math.min(basePrice, Math.floor((budget + 10) / 100) * 100 - 10);
        products[product.id] = {basePrice, serviceFee, finalPrice: basePrice + serviceFee};
    }
    return {pricingMode: "budget-scaled-rounded-v1", referenceBudget: 7000, statedBudget: budget, multiplier, serviceFee, products};
}
function getPricing(preferences) {
    return preferences.pricing || calculatePricing(Number(preferences.budget));
}
