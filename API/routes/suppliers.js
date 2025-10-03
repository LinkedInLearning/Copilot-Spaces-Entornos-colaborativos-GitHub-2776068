import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load suppliers data
const loadSuppliersData = () => {
  try {
    const dataPath = path.join(__dirname, '../data/suppliers.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading suppliers data:', error);
    return { suppliers: [], categories: [] };
  }
};

/**
 * @route GET /api/v1/suppliers
 * @desc Get all suppliers with optional filtering
 * @access Public
 */
router.get('/', (req, res) => {
  try {
    const suppliersData = loadSuppliersData();
    let suppliers = suppliersData.suppliers;

    // Apply filters
    const { category, country, verified, search, limit, offset } = req.query;

    if (category && category !== 'all') {
      suppliers = suppliers.filter(s => s.category === category);
    }

    if (country && country !== 'all') {
      suppliers = suppliers.filter(s => s.country === country);
    }

    if (verified === 'true') {
      suppliers = suppliers.filter(s => s.verified === true);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      suppliers = suppliers.filter(s => 
        s.name.toLowerCase().includes(searchTerm) ||
        s.city.toLowerCase().includes(searchTerm) ||
        s.products.some(p => p.toLowerCase().includes(searchTerm))
      );
    }

    // Pagination
    const limitNum = parseInt(limit) || suppliers.length;
    const offsetNum = parseInt(offset) || 0;
    const paginatedSuppliers = suppliers.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      data: paginatedSuppliers,
      pagination: {
        total: suppliers.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < suppliers.length
      },
      filters: {
        categories: suppliersData.categories,
        countries: [...new Set(suppliersData.suppliers.map(s => s.country))]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suppliers data'
    });
  }
});

/**
 * @route GET /api/v1/suppliers/:id
 * @desc Get supplier by ID
 * @access Public
 */
router.get('/:id', (req, res) => {
  try {
    const suppliersData = loadSuppliersData();
    const supplier = suppliersData.suppliers.find(s => s.id === parseInt(req.params.id));
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supplier data'
    });
  }
});

/**
 * @route GET /api/v1/suppliers/:id/validate
 * @desc Validate supplier quality and reliability
 * @access Public
 */
router.get('/:id/validate', (req, res) => {
  try {
    const suppliersData = loadSuppliersData();
    const supplier = suppliersData.suppliers.find(s => s.id === parseInt(req.params.id));
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    const validationPoints = [];

    // Verification status
    if (supplier.verified) {
      validationPoints.push({ 
        type: 'success', 
        category: 'verification',
        message: 'Proveedor verificado y confiable' 
      });
    } else {
      validationPoints.push({ 
        type: 'warning', 
        category: 'verification',
        message: 'Proveedor no verificado - requiere validación adicional' 
      });
    }

    // Rating validation
    if (supplier.rating >= 4.5) {
      validationPoints.push({ 
        type: 'success', 
        category: 'rating',
        message: 'Excelente calificación de clientes' 
      });
    } else if (supplier.rating >= 4.0) {
      validationPoints.push({ 
        type: 'info', 
        category: 'rating',
        message: 'Buena calificación de clientes' 
      });
    } else {
      validationPoints.push({ 
        type: 'warning', 
        category: 'rating',
        message: 'Calificación promedio - revisar referencias' 
      });
    }

    // Certifications
    if (supplier.certifications.length >= 3) {
      validationPoints.push({ 
        type: 'success', 
        category: 'certifications',
        message: 'Múltiples certificaciones de calidad' 
      });
    } else if (supplier.certifications.length >= 1) {
      validationPoints.push({ 
        type: 'info', 
        category: 'certifications',
        message: 'Certificaciones básicas disponibles' 
      });
    } else {
      validationPoints.push({ 
        type: 'danger', 
        category: 'certifications',
        message: 'Sin certificaciones de calidad' 
      });
    }

    // Financial capacity
    const annualRevenue = parseFloat(supplier.tradeCapacity.annualRevenue.replace(/[$M]/g, ''));
    if (annualRevenue >= 20) {
      validationPoints.push({ 
        type: 'success', 
        category: 'financial',
        message: 'Empresa con alta capacidad financiera' 
      });
    } else if (annualRevenue >= 10) {
      validationPoints.push({ 
        type: 'info', 
        category: 'financial',
        message: 'Empresa con capacidad financiera estable' 
      });
    } else {
      validationPoints.push({ 
        type: 'warning', 
        category: 'financial',
        message: 'Empresa pequeña - evaluar capacidad de entrega' 
      });
    }

    // Calculate overall score
    const successPoints = validationPoints.filter(p => p.type === 'success').length;
    const totalPoints = validationPoints.length;
    const score = Math.round((successPoints / totalPoints) * 100);

    let overallRating;
    if (score >= 75) overallRating = 'excellent';
    else if (score >= 50) overallRating = 'good';
    else if (score >= 25) overallRating = 'fair';
    else overallRating = 'poor';

    res.json({
      success: true,
      data: {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          country: supplier.country
        },
        validation: {
          score,
          rating: overallRating,
          points: validationPoints
        },
        recommendation: score >= 75 ? 'Recomendado' : 
                       score >= 50 ? 'Considerar con precaución' : 'No recomendado'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to validate supplier'
    });
  }
});

/**
 * @route GET /api/v1/suppliers/categories
 * @desc Get all supplier categories
 * @access Public
 */
router.get('/categories', (req, res) => {
  try {
    const suppliersData = loadSuppliersData();
    res.json({
      success: true,
      data: suppliersData.categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

export default router;