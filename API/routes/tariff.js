import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load markets data
const loadMarketsData = () => {
  try {
    const dataPath = path.join(__dirname, '../data/markets.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading markets data:', error);
    return { markets: [] };
  }
};

// Standard tariff rates by country and product category
const standardTariffRates = {
  'US': {
    'electronics': 3.2,
    'textiles': 11.4,
    'machinery': 2.5,
    'chemicals': 8.5,
    'food': 12.0,
    'automotive': 35.0,
    'pharmaceuticals': 6.0,
    'commodities': 8.0
  },
  'EU': {
    'electronics': 4.7,
    'textiles': 9.8,
    'machinery': 3.1,
    'chemicals': 6.2,
    'food': 15.6,
    'automotive': 22.0,
    'pharmaceuticals': 4.5,
    'commodities': 7.3
  },
  'CN': {
    'electronics': 8.1,
    'textiles': 16.2,
    'machinery': 12.7,
    'chemicals': 15.3,
    'food': 22.8,
    'automotive': 40.0,
    'pharmaceuticals': 8.9,
    'commodities': 18.5
  },
  'JP': {
    'electronics': 2.1,
    'textiles': 7.4,
    'machinery': 1.8,
    'chemicals': 4.2,
    'food': 18.9,
    'automotive': 15.0,
    'pharmaceuticals': 3.1,
    'commodities': 5.7
  },
  'BR': {
    'electronics': 12.8,
    'textiles': 20.1,
    'machinery': 14.5,
    'chemicals': 18.7,
    'food': 16.3,
    'automotive': 35.0,
    'pharmaceuticals': 10.2,
    'commodities': 15.9
  }
};

// Additional fees that may apply
const additionalFees = {
  'US': [
    { name: 'Harbor Maintenance Fee', rate: 0.125, description: 'Fee for port maintenance' },
    { name: 'Merchandise Processing Fee', rate: 0.3464, description: 'Customs processing fee', max: 538.40 }
  ],
  'EU': [
    { name: 'VAT', rate: 20.0, description: 'Value Added Tax' },
    { name: 'Customs Handling Fee', amount: 25, description: 'Fixed handling fee' }
  ],
  'CN': [
    { name: 'Import VAT', rate: 13.0, description: 'Import Value Added Tax' },
    { name: 'Consumption Tax', rate: 5.0, description: 'Consumption tax on luxury goods' }
  ],
  'JP': [
    { name: 'Consumption Tax', rate: 10.0, description: 'Japan consumption tax' }
  ],
  'BR': [
    { name: 'IPI', rate: 8.0, description: 'Industrialized Products Tax' },
    { name: 'ICMS', rate: 18.0, description: 'State circulation tax' }
  ]
};

/**
 * @route GET /api/v1/tariff/rates
 * @desc Get all tariff rates by country and category
 * @access Public
 */
router.get('/rates', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        tariffRates: standardTariffRates,
        categories: Object.keys(standardTariffRates['US'] || {}),
        countries: Object.keys(standardTariffRates)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tariff rates'
    });
  }
});

/**
 * @route GET /api/v1/tariff/rates/:country/:category
 * @desc Get tariff rate for specific country and product category
 * @access Public
 */
router.get('/rates/:country/:category', (req, res) => {
  try {
    const { country, category } = req.params;
    const countryUpper = country.toUpperCase();
    const categoryLower = category.toLowerCase();

    const countryRates = standardTariffRates[countryUpper];
    if (!countryRates) {
      return res.status(404).json({
        success: false,
        error: `Tariff rates not available for country: ${countryUpper}`
      });
    }

    const rate = countryRates[categoryLower];
    if (rate === undefined) {
      return res.status(404).json({
        success: false,
        error: `Tariff rate not available for category: ${categoryLower} in ${countryUpper}`
      });
    }

    res.json({
      success: true,
      data: {
        country: countryUpper,
        category: categoryLower,
        tariffRate: rate,
        unit: 'percentage'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tariff rate'
    });
  }
});

/**
 * @route POST /api/v1/tariff/calculate
 * @desc Calculate tariff for a product
 * @access Public
 */
router.post('/calculate', (req, res) => {
  try {
    const { productValue, country, productCategory, currency = 'USD' } = req.body;

    if (!productValue || !country || !productCategory) {
      return res.status(400).json({
        success: false,
        error: 'Product value, country, and product category are required'
      });
    }

    if (isNaN(productValue) || productValue <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Product value must be a positive number'
      });
    }

    const countryUpper = country.toUpperCase();
    const categoryLower = productCategory.toLowerCase();

    // Get tariff rate
    const countryRates = standardTariffRates[countryUpper];
    if (!countryRates) {
      return res.status(400).json({
        success: false,
        error: `Tariff rates not available for country: ${countryUpper}`
      });
    }

    let tariffRate = countryRates[categoryLower];
    if (tariffRate === undefined) {
      // Use default rate if specific category not found
      tariffRate = countryRates['commodities'] || 5.0;
    }

    // Calculate basic tariff
    const tariffAmount = (productValue * tariffRate) / 100;
    let totalCost = productValue + tariffAmount;

    // Calculate additional fees
    const applicableFees = [];
    const countryFees = additionalFees[countryUpper] || [];

    countryFees.forEach(fee => {
      let feeAmount = 0;
      if (fee.rate) {
        feeAmount = (totalCost * fee.rate) / 100;
        if (fee.max && feeAmount > fee.max) {
          feeAmount = fee.max;
        }
      } else if (fee.amount) {
        feeAmount = fee.amount;
      }

      applicableFees.push({
        name: fee.name,
        amount: Math.round(feeAmount * 100) / 100,
        description: fee.description
      });

      totalCost += feeAmount;
    });

    res.json({
      success: true,
      data: {
        productValue: parseFloat(productValue),
        tariffRate,
        tariffAmount: Math.round(tariffAmount * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        currency: currency.toUpperCase(),
        country: countryUpper,
        productCategory: categoryLower,
        additionalFees: applicableFees,
        breakdown: {
          originalValue: parseFloat(productValue),
          basicTariff: Math.round(tariffAmount * 100) / 100,
          additionalFees: Math.round((totalCost - productValue - tariffAmount) * 100) / 100,
          total: Math.round(totalCost * 100) / 100
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to calculate tariff'
    });
  }
});

/**
 * @route POST /api/v1/tariff/compare
 * @desc Compare tariffs across multiple countries
 * @access Public
 */
router.post('/compare', (req, res) => {
  try {
    const { productValue, productCategory, countries, currency = 'USD' } = req.body;

    if (!productValue || !productCategory || !Array.isArray(countries) || countries.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Product value, product category, and countries array are required'
      });
    }

    if (isNaN(productValue) || productValue <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Product value must be a positive number'
      });
    }

    const categoryLower = productCategory.toLowerCase();
    const comparisons = [];

    countries.forEach(country => {
      const countryUpper = country.toUpperCase();
      const countryRates = standardTariffRates[countryUpper];

      if (!countryRates) {
        comparisons.push({
          country: countryUpper,
          error: 'Tariff rates not available'
        });
        return;
      }

      let tariffRate = countryRates[categoryLower];
      if (tariffRate === undefined) {
        tariffRate = countryRates['commodities'] || 5.0;
      }

      const tariffAmount = (productValue * tariffRate) / 100;
      let totalCost = productValue + tariffAmount;

      // Calculate additional fees
      const applicableFees = [];
      const countryFees = additionalFees[countryUpper] || [];

      countryFees.forEach(fee => {
        let feeAmount = 0;
        if (fee.rate) {
          feeAmount = (totalCost * fee.rate) / 100;
          if (fee.max && feeAmount > fee.max) {
            feeAmount = fee.max;
          }
        } else if (fee.amount) {
          feeAmount = fee.amount;
        }

        applicableFees.push({
          name: fee.name,
          amount: Math.round(feeAmount * 100) / 100
        });

        totalCost += feeAmount;
      });

      comparisons.push({
        country: countryUpper,
        tariffRate,
        tariffAmount: Math.round(tariffAmount * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        additionalFees: applicableFees.reduce((sum, fee) => sum + fee.amount, 0)
      });
    });

    // Sort by total cost
    comparisons.sort((a, b) => (a.totalCost || Infinity) - (b.totalCost || Infinity));

    res.json({
      success: true,
      data: {
        productValue: parseFloat(productValue),
        productCategory: categoryLower,
        currency: currency.toUpperCase(),
        comparisons,
        bestOption: comparisons.find(c => !c.error) || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to compare tariffs'
    });
  }
});

/**
 * @route GET /api/v1/tariff/categories
 * @desc Get available product categories
 * @access Public
 */
router.get('/categories', (req, res) => {
  try {
    const categories = Object.keys(standardTariffRates['US'] || {});
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

export default router;