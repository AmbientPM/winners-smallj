/**
 * Format large numbers into abbreviated form (1K, 100K, 1M, etc.)
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string
 */
export function formatCompactNumber(value: number, decimals: number = 1): string {
    // Handle undefined, null, or NaN
    if (value === undefined || value === null || isNaN(value)) return "0";
    if (value === 0) return "0";

    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    if (absValue < 1000) {
        // For numbers less than 1000, just return the number without commas
        return sign + absValue.toFixed(decimals).replace(/\.0+$/, '');
    }

    const tiers = [
        { suffix: "T", threshold: 1e12 }, // Trillion
        { suffix: "B", threshold: 1e9 },  // Billion
        { suffix: "M", threshold: 1e6 },  // Million
        { suffix: "K", threshold: 1e3 },  // Thousand
    ];

    for (const tier of tiers) {
        if (absValue >= tier.threshold) {
            const scaled = value / tier.threshold;
            return sign + scaled.toFixed(decimals) + tier.suffix;
        }
    }

    return sign + value.toString();
}

/**
 * Format currency with abbreviated numbers
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with $ prefix
 */
export function formatCompactCurrency(value: number, decimals: number = 1): string {
    return formatCompactNumber(value, decimals);
}

/**
 * Format percentage values
 * @param value - The percentage value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with % suffix
 */
export function formatPercentage(value: number, decimals: number = 2): string {
    // Handle undefined, null, or NaN
    if (value === undefined || value === null || isNaN(value)) return "0%";
    if (value === 0) return "0%";

    const absValue = Math.abs(value);

    // For very small values, show "<0.01%"
    if (absValue < 0.01) {
        return value < 0 ? "-<0.01%" : "<0.01%";
    }

    // For normal values, use specified decimals
    return value.toFixed(decimals) + "%";
}
