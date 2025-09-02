// Mock conversion rates
const CURRENCY_RATES: { [key: string]: number } = {
    'USD_INR': 83.50,
    'INR_USD': 1 / 83.50,
    'USD_EUR': 0.92,
    'EUR_USD': 1 / 0.92,
    'USD_GBP': 0.79,
    'GBP_USD': 1 / 0.79,
};

const UNIT_CONVERSIONS: { [key: string]: { factor: number, to: string } } = {
    // Length
    'km_miles': { factor: 0.621371, to: 'miles' },
    'miles_km': { factor: 1.60934, to: 'km' },
    'm_ft': { factor: 3.28084, to: 'ft' },
    'ft_m': { factor: 0.3048, to: 'm' },
    // Weight
    'kg_lbs': { factor: 2.20462, to: 'lbs' },
    'lbs_kg': { factor: 0.453592, to: 'kg' },
    // Temperature
    'c_f': { factor: 0, to: 'F' }, // special case
    'f_c': { factor: 0, to: 'C' }, // special case
    // Energy
    'kcal_kj': { factor: 4.184, to: 'kJ' },
    'kj_kcal': { factor: 1 / 4.184, to: 'kcal' },
    // Power
    'hp_watts': { factor: 745.7, to: 'watts' },
    'watts_hp': { factor: 1 / 745.7, to: 'hp' },
};

export function parseSmartQuery(query: string): string {
    query = query.trim().toLowerCase();

    // Currency conversion: "100 usd to inr"
    const currencyMatch = query.match(/^(\d+(\.\d+)?)\s*([a-zA-Z]{3})\s*(to|in)\s*([a-zA-Z]{3})$/);
    if (currencyMatch) {
        const amount = parseFloat(currencyMatch[1]);
        const from = currencyMatch[3].toUpperCase();
        const to = currencyMatch[5].toUpperCase();
        const rateKey = `${from}_${to}`;

        if (rateKey in CURRENCY_RATES) {
            const convertedAmount = amount * CURRENCY_RATES[rateKey];
            return `${amount} ${from} = ${convertedAmount.toFixed(2)} ${to}`;
        } else {
            throw new Error(`Currency conversion from ${from} to ${to} is not supported.`);
        }
    }

    // Unit conversion: "5 km to miles"
    const unitMatch = query.match(/^(\d+(\.\d+)?)\s*([a-zA-Z]+)\s*(to|in)\s*([a-zA-Z]+)$/);
    if (unitMatch) {
        const amount = parseFloat(unitMatch[1]);
        const fromUnit = unitMatch[3].replace(/s$/, ''); // remove plural s
        const toUnit = unitMatch[5].replace(/s$/, ''); // remove plural s
        const key = `${fromUnit}_${toUnit}`;
        
        // Special case for temperature
        if (fromUnit === 'c' && toUnit === 'f') {
            const result = (amount * 9/5) + 32;
            return `${amount}°C = ${result.toFixed(2)}°F`;
        }
        if (fromUnit === 'f' && toUnit === 'c') {
            const result = (amount - 32) * 5/9;
            return `${amount}°F = ${result.toFixed(2)}°C`;
        }

        if (key in UNIT_CONVERSIONS) {
            const conversion = UNIT_CONVERSIONS[key];
            const result = amount * conversion.factor;
            return `${amount} ${fromUnit} = ${result.toFixed(3)} ${conversion.to}`;
        } else {
             // Handle pluralization in the key, e.g. "watts" -> "watt"
            const singularToUnit = toUnit.endsWith('s') ? toUnit.slice(0, -1) : toUnit;
            const singularKey = `${fromUnit}_${singularToUnit}s`; // e.g. hp_watts
            if(singularKey in UNIT_CONVERSIONS){
                 const conversion = UNIT_CONVERSIONS[singularKey];
                 const result = amount * conversion.factor;
                 return `${amount} ${fromUnit} = ${result.toFixed(3)} ${conversion.to}`;
            }
            throw new Error(`Unit conversion from ${fromUnit} to ${toUnit} is not supported.`);
        }
    }

    throw new Error("Sorry, I can't understand that format. Try '100 USD to INR' or '5 km to miles'.");
}
