import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load markets data for exchange rates
const loadMarketsData = () => {
  try {
    const dataPath = path.join(__dirname, '../data/markets.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading markets data:', error);
    return { exchangeRates: { rates: {}, baseCurrency: 'USD', lastUpdated: new Date().toISOString() } };
  }
};

/**
 * @route GET /api/v1/currency/rates
 * @desc Get all exchange rates
 * @access Public
 */
router.get('/rates', (req, res) => {
  try {
    const marketsData = loadMarketsData();
    const exchangeRates = marketsData.exchangeRates;

    res.json({
      success: true,
      data: {
        baseCurrency: exchangeRates.baseCurrency,
        rates: exchangeRates.rates,
        lastUpdated: exchangeRates.lastUpdated,
        availableCurrencies: [exchangeRates.baseCurrency, ...Object.keys(exchangeRates.rates)]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exchange rates'
    });
  }
});

/**
 * @route GET /api/v1/currency/rates/:from/:to
 * @desc Get exchange rate between two currencies
 * @access Public
 */
router.get('/rates/:from/:to', (req, res) => {
  try {
    const { from, to } = req.params;
    const marketsData = loadMarketsData();
    const exchangeRates = marketsData.exchangeRates;

    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    // Calculate exchange rate
    let rate;
    if (fromUpper === exchangeRates.baseCurrency && exchangeRates.rates[toUpper]) {
      rate = exchangeRates.rates[toUpper];
    } else if (toUpper === exchangeRates.baseCurrency && exchangeRates.rates[fromUpper]) {
      rate = 1 / exchangeRates.rates[fromUpper];
    } else if (exchangeRates.rates[fromUpper] && exchangeRates.rates[toUpper]) {
      rate = exchangeRates.rates[toUpper] / exchangeRates.rates[fromUpper];
    } else if (fromUpper === toUpper) {
      rate = 1;
    } else {
      return res.status(400).json({
        success: false,
        error: `Exchange rate not available for ${fromUpper} to ${toUpper}`
      });
    }

    res.json({
      success: true,
      data: {
        from: fromUpper,
        to: toUpper,
        rate,
        lastUpdated: exchangeRates.lastUpdated
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exchange rate'
    });
  }
});

/**
 * @route POST /api/v1/currency/convert
 * @desc Convert amount between currencies
 * @access Public
 */
router.post('/convert', (req, res) => {
  try {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
      return res.status(400).json({
        success: false,
        error: 'Amount, from, and to currencies are required'
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number'
      });
    }

    const marketsData = loadMarketsData();
    const exchangeRates = marketsData.exchangeRates;

    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    // Calculate exchange rate
    let rate;
    if (fromUpper === exchangeRates.baseCurrency && exchangeRates.rates[toUpper]) {
      rate = exchangeRates.rates[toUpper];
    } else if (toUpper === exchangeRates.baseCurrency && exchangeRates.rates[fromUpper]) {
      rate = 1 / exchangeRates.rates[fromUpper];
    } else if (exchangeRates.rates[fromUpper] && exchangeRates.rates[toUpper]) {
      rate = exchangeRates.rates[toUpper] / exchangeRates.rates[fromUpper];
    } else if (fromUpper === toUpper) {
      rate = 1;
    } else {
      return res.status(400).json({
        success: false,
        error: `Exchange rate not available for ${fromUpper} to ${toUpper}`
      });
    }

    const convertedAmount = amount * rate;

    res.json({
      success: true,
      data: {
        originalAmount: parseFloat(amount),
        originalCurrency: fromUpper,
        convertedAmount: Math.round(convertedAmount * 100) / 100,
        targetCurrency: toUpper,
        exchangeRate: Math.round(rate * 10000) / 10000,
        lastUpdated: exchangeRates.lastUpdated
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to convert currency'
    });
  }
});

/**
 * @route POST /api/v1/currency/convert/batch
 * @desc Convert multiple amounts in batch
 * @access Public
 */
router.post('/convert/batch', (req, res) => {
  try {
    const { conversions } = req.body;

    if (!Array.isArray(conversions) || conversions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Conversions array is required'
      });
    }

    const marketsData = loadMarketsData();
    const exchangeRates = marketsData.exchangeRates;

    const results = conversions.map((conversion, index) => {
      const { amount, from, to } = conversion;

      if (!amount || !from || !to) {
        return {
          index,
          success: false,
          error: 'Amount, from, and to currencies are required'
        };
      }

      if (isNaN(amount) || amount <= 0) {
        return {
          index,
          success: false,
          error: 'Amount must be a positive number'
        };
      }

      const fromUpper = from.toUpperCase();
      const toUpper = to.toUpperCase();

      // Calculate exchange rate
      let rate;
      if (fromUpper === exchangeRates.baseCurrency && exchangeRates.rates[toUpper]) {
        rate = exchangeRates.rates[toUpper];
      } else if (toUpper === exchangeRates.baseCurrency && exchangeRates.rates[fromUpper]) {
        rate = 1 / exchangeRates.rates[fromUpper];
      } else if (exchangeRates.rates[fromUpper] && exchangeRates.rates[toUpper]) {
        rate = exchangeRates.rates[toUpper] / exchangeRates.rates[fromUpper];
      } else if (fromUpper === toUpper) {
        rate = 1;
      } else {
        return {
          index,
          success: false,
          error: `Exchange rate not available for ${fromUpper} to ${toUpper}`
        };
      }

      const convertedAmount = amount * rate;

      return {
        index,
        success: true,
        data: {
          originalAmount: parseFloat(amount),
          originalCurrency: fromUpper,
          convertedAmount: Math.round(convertedAmount * 100) / 100,
          targetCurrency: toUpper,
          exchangeRate: Math.round(rate * 10000) / 10000
        }
      };
    });

    res.json({
      success: true,
      data: results,
      lastUpdated: exchangeRates.lastUpdated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process batch conversion'
    });
  }
});

/**
 * @route GET /api/v1/currency/currencies
 * @desc Get list of available currencies
 * @access Public
 */
router.get('/currencies', (req, res) => {
  try {
    const marketsData = loadMarketsData();
    const exchangeRates = marketsData.exchangeRates;

    const currencies = [exchangeRates.baseCurrency, ...Object.keys(exchangeRates.rates)];

    res.json({
      success: true,
      data: currencies.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch currencies'
    });
  }
});

export default router;