// Tariff calculation utilities for international trade
import marketsData from '../configs/markets.json';

export interface TariffCalculation {
  productValue: number;
  tariffRate: number;
  tariffAmount: number;
  totalCost: number;
  currency: string;
  country: string;
  productCategory: string;
  additionalFees?: {
    name: string;
    amount: number;
    description: string;
  }[];
}

export interface TariffRateData {
  [country: string]: {
    [category: string]: number;
  };
}

class TariffCalculator {
  private markets: any[];
  private standardTariffRates: TariffRateData;
  private additionalFees: any;

  constructor() {
    this.markets = marketsData.markets;
    
    // Standard tariff rates by country and product category
    this.standardTariffRates = {
      'US': {
        'electronics': 6.2,
        'textiles': 11.4,
        'machinery': 2.5,
        'chemicals': 3.7,
        'food': 5.1,
        'automotive': 2.5,
        'pharmaceuticals': 0.0,
        'commodities': 1.2
      },
      'EU': {
        'electronics': 4.2,
        'textiles': 9.6,
        'machinery': 1.7,
        'chemicals': 4.1,
        'food': 17.8,
        'automotive': 10.0,
        'pharmaceuticals': 0.0,
        'commodities': 2.1
      },
      'CN': {
        'electronics': 8.0,
        'textiles': 15.9,
        'machinery': 8.6,
        'chemicals': 6.6,
        'food': 15.6,
        'automotive': 25.0,
        'pharmaceuticals': 4.0,
        'commodities': 3.0
      },
      'JP': {
        'electronics': 0.0,
        'textiles': 7.4,
        'machinery': 0.0,
        'chemicals': 2.8,
        'food': 21.3,
        'automotive': 0.0,
        'pharmaceuticals': 0.0,
        'commodities': 2.5
      },
      'BR': {
        'electronics': 16.0,
        'textiles': 18.0,
        'machinery': 14.0,
        'chemicals': 8.5,
        'food': 12.0,
        'automotive': 35.0,
        'pharmaceuticals': 6.0,
        'commodities': 8.0
      }
    };

    // Additional fees that may apply
    this.additionalFees = {
      'US': [
        { name: 'Harbor Maintenance Fee', rate: 0.125, description: 'Fee for port maintenance' },
        { name: 'Merchandise Processing Fee', rate: 0.3464, description: 'Customs processing fee', max: 538.40 }
      ],
      'EU': [
        { name: 'VAT', rate: 20.0, description: 'Value Added Tax' },
        { name: 'Customs Handling Fee', amount: 25, description: 'Fixed handling fee' }
      ],
      'CN': [
        { name: 'VAT', rate: 13.0, description: 'Value Added Tax' },
        { name: 'Consumption Tax', rate: 10.0, description: 'Luxury goods tax', categories: ['automotive'] }
      ],
      'JP': [
        { name: 'Consumption Tax', rate: 10.0, description: 'Japanese consumption tax' }
      ],
      'BR': [
        { name: 'ICMS', rate: 18.0, description: 'State tax on circulation of goods' },
        { name: 'PIS/COFINS', rate: 9.25, description: 'Federal social contribution' }
      ]
    };
  }

  /**
   * Calculate total tariff and import costs
   */
  calculateTariff(
    productValue: number,
    country: string,
    productCategory: string,
    currency: string = 'USD',
    includeAdditionalFees: boolean = true
  ): TariffCalculation {
    // Get tariff rate for the specific country and category
    const tariffRate = this.getTariffRate(country, productCategory);
    const tariffAmount = productValue * (tariffRate / 100);
    
    let totalCost = productValue + tariffAmount;
    let additionalFees: { name: string; amount: number; description: string; }[] = [];

    if (includeAdditionalFees) {
      additionalFees = this.calculateAdditionalFees(productValue + tariffAmount, country, productCategory);
      const totalAdditionalFees = additionalFees.reduce((sum, fee) => sum + fee.amount, 0);
      totalCost += totalAdditionalFees;
    }

    return {
      productValue,
      tariffRate,
      tariffAmount: Math.round(tariffAmount * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      currency,
      country,
      productCategory,
      additionalFees: additionalFees.length > 0 ? additionalFees : undefined
    };
  }

  /**
   * Get tariff rate for specific country and product category
   */
  getTariffRate(country: string, productCategory: string): number {
    const countryRates = this.standardTariffRates[country];
    if (!countryRates) {
      // Return average tariff from markets data if specific rates not available
      const market = this.markets.find(m => m.id === country);
      return market ? market.averageTariff : 5.0; // Default 5% if no data
    }

    return countryRates[productCategory] || countryRates['commodities'] || 5.0;
  }

  /**
   * Calculate additional fees (VAT, handling fees, etc.)
   */
  private calculateAdditionalFees(
    dutiableValue: number,
    country: string,
    productCategory: string
  ): { name: string; amount: number; description: string; }[] {
    const fees = this.additionalFees[country] || [];
    const calculatedFees: { name: string; amount: number; description: string; }[] = [];

    fees.forEach((fee: any) => {
      // Check if fee applies to this product category
      if (fee.categories && !fee.categories.includes(productCategory)) {
        return;
      }

      let amount = 0;
      if (fee.rate) {
        // Percentage-based fee
        amount = dutiableValue * (fee.rate / 100);
        // Apply maximum if specified
        if (fee.max && amount > fee.max) {
          amount = fee.max;
        }
      } else if (fee.amount) {
        // Fixed amount fee
        amount = fee.amount;
      }

      if (amount > 0) {
        calculatedFees.push({
          name: fee.name,
          amount: Math.round(amount * 100) / 100,
          description: fee.description
        });
      }
    });

    return calculatedFees;
  }

  /**
   * Calculate tariffs for multiple products
   */
  calculateBatchTariffs(
    products: Array<{
      value: number;
      country: string;
      category: string;
      currency?: string;
    }>
  ): TariffCalculation[] {
    return products.map(product =>
      this.calculateTariff(
        product.value,
        product.country,
        product.category,
        product.currency
      )
    );
  }

  /**
   * Compare tariff costs across multiple countries
   */
  compareTariffsByCountry(
    productValue: number,
    productCategory: string,
    countries: string[],
    currency: string = 'USD'
  ): TariffCalculation[] {
    return countries.map(country =>
      this.calculateTariff(productValue, country, productCategory, currency)
    ).sort((a, b) => a.totalCost - b.totalCost);
  }

  /**
   * Get all available product categories
   */
  getProductCategories(): string[] {
    return Object.keys(this.standardTariffRates['US'] || {});
  }

  /**
   * Get all supported countries
   */
  getSupportedCountries(): { id: string; name: string; }[] {
    return this.markets.map(market => ({
      id: market.id,
      name: market.name
    }));
  }

  /**
   * Estimate total landed cost including shipping
   */
  calculateLandedCost(
    productValue: number,
    country: string,
    productCategory: string,
    shippingCost: number = 0,
    insuranceCost: number = 0,
    currency: string = 'USD'
  ): TariffCalculation & { shippingCost: number; insuranceCost: number; landedCost: number; } {
    const tariffCalc = this.calculateTariff(productValue, country, productCategory, currency);
    const landedCost = tariffCalc.totalCost + shippingCost + insuranceCost;

    return {
      ...tariffCalc,
      shippingCost,
      insuranceCost,
      landedCost: Math.round(landedCost * 100) / 100
    };
  }
}

// Export singleton instance
export const tariffCalculator = new TariffCalculator();

// Export named functions for direct use
export const calculateTariff = (
  productValue: number,
  country: string,
  productCategory: string,
  currency?: string
): TariffCalculation => {
  return tariffCalculator.calculateTariff(productValue, country, productCategory, currency);
};

export const getTariffRate = (country: string, productCategory: string): number => {
  return tariffCalculator.getTariffRate(country, productCategory);
};

export const compareTariffsByCountry = (
  productValue: number,
  productCategory: string,
  countries: string[]
): TariffCalculation[] => {
  return tariffCalculator.compareTariffsByCountry(productValue, productCategory, countries);
};

export default tariffCalculator;