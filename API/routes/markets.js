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
    return { markets: [], exchangeRates: { rates: {}, baseCurrency: 'USD', lastUpdated: new Date().toISOString() } };
  }
};

/**
 * @route GET /api/v1/markets
 * @desc Get all markets
 * @access Public
 */
router.get('/', (req, res) => {
  try {
    const marketsData = loadMarketsData();
    res.json({
      success: true,
      data: marketsData.markets,
      count: marketsData.markets.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch markets data'
    });
  }
});

/**
 * @route GET /api/v1/markets/:id
 * @desc Get market by ID
 * @access Public
 */
router.get('/:id', (req, res) => {
  try {
    const marketsData = loadMarketsData();
    const market = marketsData.markets.find(m => m.id === req.params.id);
    
    if (!market) {
      return res.status(404).json({
        success: false,
        error: 'Market not found'
      });
    }

    res.json({
      success: true,
      data: market
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market data'
    });
  }
});

/**
 * @route GET /api/v1/markets/:id/trends
 * @desc Get market trends for a specific market
 * @access Public
 */
router.get('/:id/trends', (req, res) => {
  try {
    const marketsData = loadMarketsData();
    const market = marketsData.markets.find(m => m.id === req.params.id);
    
    if (!market) {
      return res.status(404).json({
        success: false,
        error: 'Market not found'
      });
    }

    // Generate mock trend data
    const periods = parseInt(req.query.periods) || 30;
    const metric = req.query.metric || 'tradeVolume';
    
    const trends = [];
    for (let i = periods; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const baseValue = getBaseValue(market.id, metric);
      const seasonality = Math.sin((i / periods) * 2 * Math.PI) * 0.1;
      const randomWalk = (Math.random() - 0.5) * 0.05;
      const trend = getTrendDirection(market.id, metric) * (i / periods) * 0.2;
      
      const value = baseValue * (1 + seasonality + randomWalk + trend);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, Math.round(value * 100) / 100),
        metric
      });
    }

    res.json({
      success: true,
      data: {
        market: market.id,
        marketName: market.name,
        metric,
        periods,
        trends
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market trends'
    });
  }
});

// Helper functions
const getBaseValue = (marketId, metric) => {
  const baseValues = {
    'US': { tradeVolume: 450, priceIndex: 105, tariffRates: 8.5, demandIndex: 95 },
    'EU': { tradeVolume: 380, priceIndex: 102, tariffRates: 12.0, demandIndex: 88 },
    'CN': { tradeVolume: 520, priceIndex: 98, tariffRates: 15.5, demandIndex: 110 },
    'JP': { tradeVolume: 290, priceIndex: 108, tariffRates: 6.8, demandIndex: 82 },
    'BR': { tradeVolume: 180, priceIndex: 94, tariffRates: 18.2, demandIndex: 75 }
  };
  
  return baseValues[marketId]?.[metric] || 100;
};

const getTrendDirection = (marketId, metric) => {
  const trends = {
    'US': { tradeVolume: 0.1, priceIndex: 0.05, tariffRates: -0.02, demandIndex: 0.08 },
    'EU': { tradeVolume: 0.05, priceIndex: 0.03, tariffRates: 0.01, demandIndex: 0.04 },
    'CN': { tradeVolume: 0.15, priceIndex: -0.02, tariffRates: 0.03, demandIndex: 0.12 },
    'JP': { tradeVolume: 0.02, priceIndex: 0.04, tariffRates: -0.01, demandIndex: 0.01 },
    'BR': { tradeVolume: 0.08, priceIndex: 0.06, tariffRates: 0.02, demandIndex: 0.07 }
  };
  
  return trends[marketId]?.[metric] || 0;
};

export default router;