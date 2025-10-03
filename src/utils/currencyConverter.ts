// Currency conversion utilities for international commerce
import marketsData from '../configs/markets.json';

export interface ExchangeRate {
  [currency: string]: number;
}

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  lastUpdated: string;
}

class CurrencyConverter {
  private exchangeRates: ExchangeRate;
  private baseCurrency: string;
  private lastUpdated: string;

  constructor() {
    this.exchangeRates = marketsData.exchangeRates.rates;
    this.baseCurrency = marketsData.exchangeRates.baseCurrency;
    this.lastUpdated = marketsData.exchangeRates.lastUpdated;
  }

  /**
   * Convert amount from one currency to another
   */
  convert(amount: number, fromCurrency: string, toCurrency: string): ConversionResult {
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: amount,
        targetCurrency: toCurrency,
        exchangeRate: 1,
        lastUpdated: this.lastUpdated
      };
    }

    let rate: number;

    if (fromCurrency === this.baseCurrency) {
      // Convert from base currency (USD) to target
      rate = this.exchangeRates[toCurrency];
      if (!rate) {
        throw new Error(`Exchange rate not found for ${toCurrency}`);
      }
    } else if (toCurrency === this.baseCurrency) {
      // Convert from source currency to base currency (USD)
      const sourceRate = this.exchangeRates[fromCurrency];
      if (!sourceRate) {
        throw new Error(`Exchange rate not found for ${fromCurrency}`);
      }
      rate = 1 / sourceRate;
    } else {
      // Convert between two non-base currencies
      const fromRate = this.exchangeRates[fromCurrency];
      const toRate = this.exchangeRates[toCurrency];
      
      if (!fromRate || !toRate) {
        throw new Error(`Exchange rate not found for ${fromCurrency} or ${toCurrency}`);
      }
      
      rate = toRate / fromRate;
    }

    const convertedAmount = amount * rate;

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount: Math.round(convertedAmount * 100) / 100,
      targetCurrency: toCurrency,
      exchangeRate: Math.round(rate * 10000) / 10000,
      lastUpdated: this.lastUpdated
    };
  }

  /**
   * Get all available currencies
   */
  getAvailableCurrencies(): string[] {
    return [this.baseCurrency, ...Object.keys(this.exchangeRates)];
  }

  /**
   * Get current exchange rate between two currencies
   */
  getExchangeRate(fromCurrency: string, toCurrency: string): number {
    const result = this.convert(1, fromCurrency, toCurrency);
    return result.exchangeRate;
  }

  /**
   * Convert multiple amounts in batch
   */
  convertBatch(conversions: Array<{amount: number, from: string, to: string}>): ConversionResult[] {
    return conversions.map(conversion => 
      this.convert(conversion.amount, conversion.from, conversion.to)
    );
  }

  /**
   * Format currency amount with proper symbol and locale
   */
  formatCurrency(amount: number, currency: string, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Calculate percentage change between two amounts
   */
  calculatePercentageChange(oldAmount: number, newAmount: number): number {
    if (oldAmount === 0) return 0;
    return Math.round(((newAmount - oldAmount) / oldAmount) * 10000) / 100;
  }
}

// Export singleton instance
export const currencyConverter = new CurrencyConverter();

// Export named functions for direct use
export const convertCurrency = (amount: number, from: string, to: string): ConversionResult => {
  return currencyConverter.convert(amount, from, to);
};

export const formatCurrency = (amount: number, currency: string, locale?: string): string => {
  return currencyConverter.formatCurrency(amount, currency, locale);
};

export const getExchangeRate = (from: string, to: string): number => {
  return currencyConverter.getExchangeRate(from, to);
};

export default currencyConverter;